from django.shortcuts import render
from rest_framework.views import APIView
import nltk
import base64
import tensorflow_hub as hub
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from rest_framework.response import Response
from rest_framework import status
from elevenlabs import clone, generate, play, voices

voices = voices()

module_url = 'md'
embed = hub.load(module_url)

def preprocess_text(text):
    # Split the text into paragraphs
    paragraphs = text.strip().split("\n")

    # Split each paragraph into sentences
    all_sentences = []
    for paragraph in paragraphs:
        sentences = nltk.sent_tokenize(paragraph)
        all_sentences.extend(sentences)

    # Remove stopwords and punctuation from each sentence
    stop_words = set(nltk.corpus.stopwords.words('english'))
    preprocessed_sentences = []
    for sentence in all_sentences:
        words = nltk.word_tokenize(sentence.lower())
        words = [word for word in words if word.isalpha() and word not in stop_words]
        preprocessed_sentences.append(" ".join(words))

    return preprocessed_sentences


def group_sentences_into_paragraphs(sentences, similarity_threshold=0.7):
    paragraphs = []
    current_paragraph = []

    for sentence in sentences:
        if not current_paragraph:
            current_paragraph.append(sentence)
        else:
            # Compute cosine similarity between the current sentence and the last sentence in the paragraph
            embeddings = embed([current_paragraph[-1], sentence])
            similarity = cosine_similarity(embeddings)[0][1]

            if similarity >= similarity_threshold:
                current_paragraph.append(sentence)
            else:
                paragraphs.append(" ".join(current_paragraph))
                current_paragraph = [sentence]

    if current_paragraph:
        paragraphs.append(" ".join(current_paragraph))

    return paragraphs


class ProcessView(APIView):
    def post(self, request, *args, **kwargs):
        data = {
            'id': request.data.get('prompt')
        }

        story = data['id']
        print(story)
        sentences = preprocess_text(story)
        paragraphs = group_sentences_into_paragraphs(sentences, similarity_threshold=0.7)
        return Response({'data': paragraphs}, status=status.HTTP_201_CREATED)