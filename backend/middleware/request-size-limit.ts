import express from 'express'

export const requestSizeLimit = [
  express.json({ limit: '10kb' }), // Pour les données JSON
  express.urlencoded({ limit: '10kb' }), // Pour les formulaires
]
