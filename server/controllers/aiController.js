import { getSlideContext, getPresentation } from '../data/presentations.js';
import { answerDoubt, answerVoiceDoubt, ingestPresentation } from '../services/geminiService.js';

/**
 * Handle user doubt question for a specific presentation slide.
 */
export async function handleDoubt(req, res, next) {
  try {
    const {
      presentationId = 'ai-video-strategy',
      slideNumber,
      slideTitle,
      slideContext: clientSlideContext,
      question
    } = req.body;

    // Validation
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Question cannot be empty. Please provide a question or doubt.'
      });
    }

    const trimmedQuestion = question.trim();
    if (trimmedQuestion.length > 500) {
      return res.status(400).json({
        success: false,
        error: 'Question is too long (maximum 500 characters).'
      });
    }

    const slideNum = parseInt(slideNumber, 10);
    if (isNaN(slideNum) || slideNum < 1) {
      return res.status(400).json({
        success: false,
        error: 'A valid slide number is required.'
      });
    }

    // Retrieve server-side canonical slide context
    const serverContext = getSlideContext(presentationId, slideNum);
    const presentation = getPresentation(presentationId);

    if (!serverContext || !presentation) {
      return res.status(404).json({
        success: false,
        error: `Presentation or slide ${slideNum} not found.`
      });
    }

    // Combine or enrich slide context
    const currentSlide = {
      ...serverContext.currentSlide,
      // If client sent additional context, enrich it
      context: clientSlideContext && clientSlideContext.length > 20
        ? clientSlideContext
        : serverContext.currentSlide.context
    };

    // Support client disconnect / cancellation via AbortController
    const abortController = new AbortController();
    req.on('close', () => {
      if (!res.writableEnded) {
        abortController.abort();
      }
    });

    const answer = await answerDoubt({
      presentationTitle: presentation.title,
      presentationDescription: presentation.description,
      currentSlide,
      prevSlideTitle: serverContext.prevSlideTitle,
      nextSlideTitle: serverContext.nextSlideTitle,
      allSlideTitles: serverContext.allSlideTitles,
      userQuestion: trimmedQuestion,
      abortSignal: abortController.signal
    });

    if (res.writableEnded) return;

    return res.status(200).json({
      success: true,
      answer,
      slideNumber: currentSlide.slideNumber,
      slideTitle: currentSlide.title
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get presentation metadata and slides
 */
export async function getPresentationDetails(req, res, next) {
  try {
    const { id } = req.params;
    const pres = getPresentation(id || 'ai-video-strategy');
    if (!pres) {
      return res.status(404).json({
        success: false,
        error: 'Presentation not found.'
      });
    }
    res.status(200).json({
      success: true,
      presentation: pres
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handle user voice doubt for a specific presentation slide.
 */
export async function handleVoiceDoubt(req, res, next) {
  try {
    const {
      presentationId = 'ai-video-strategy',
      slideNumber,
      slideTitle,
      slideContext: clientSlideContext,
      audioBase64,
      mimeType = 'audio/webm'
    } = req.body;

    const slideNum = parseInt(slideNumber, 10);
    if (isNaN(slideNum) || slideNum < 1) {
      return res.status(400).json({
        success: false,
        error: 'A valid slide number is required.'
      });
    }

    const serverContext = getSlideContext(presentationId, slideNum);
    const presentation = getPresentation(presentationId);

    if (!serverContext || !presentation) {
      return res.status(404).json({
        success: false,
        error: `Presentation or slide ${slideNum} not found.`
      });
    }

    const currentSlide = {
      ...serverContext.currentSlide,
      context: clientSlideContext && clientSlideContext.length > 20
        ? clientSlideContext
        : serverContext.currentSlide.context
    };

    const abortController = new AbortController();
    req.on('close', () => {
      if (!res.writableEnded) {
        abortController.abort();
      }
    });

    const result = await answerVoiceDoubt({
      presentationTitle: presentation.title,
      presentationDescription: presentation.description,
      currentSlide,
      prevSlideTitle: serverContext.prevSlideTitle,
      nextSlideTitle: serverContext.nextSlideTitle,
      allSlideTitles: serverContext.allSlideTitles,
      audioBase64,
      mimeType,
      abortSignal: abortController.signal
    });

    if (res.writableEnded) return;

    return res.status(200).json({
      success: true,
      question: result.question,
      answer: result.answer,
      slideNumber: currentSlide.slideNumber,
      slideTitle: currentSlide.title
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Feature 8: Handle presentation ingestion from uploaded file or topic outline
 */
export async function handleUploadPresentation(req, res, next) {
  try {
    const { fileBase64, mimeType, textContent, topicTitle } = req.body;

    if (!fileBase64 && !textContent && !topicTitle) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a file, text outline, or presentation topic.'
      });
    }

    const presentation = await ingestPresentation({
      fileBase64,
      mimeType,
      textContent,
      topicTitle
    });

    return res.status(200).json({
      success: true,
      presentationId: presentation.id,
      presentation
    });
  } catch (error) {
    next(error);
  }
}

