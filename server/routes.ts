import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs/promises";

// Configuration de multer pour stocker les fichiers temporairement
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB
  }
});

export function registerRoutes(app: Express): Server {
  const httpServer = createServer(app);

  // Créer le dossier uploads s'il n'existe pas
  fs.mkdir('uploads').catch(() => {});

  // Route pour upload et servir les PDFs
  app.post('/api/upload-pdf', upload.single('file'), (req, res) => {
    if (!req.file) {
      return res.status(400).send('Aucun fichier n\'a été uploadé');
    }

    // Renvoie l'URL du fichier
    res.json({ 
      url: `/api/pdf/${req.file.filename}`,
      filename: req.file.originalname
    });
  });

  // Route pour servir les PDFs
  app.get('/api/pdf/:filename', async (req, res) => {
    try {
      const filePath = path.join('uploads', req.params.filename);
      const stat = await fs.stat(filePath);

      res.setHeader('Content-Length', stat.size);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename=${req.params.filename}`);

      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      res.status(404).send('PDF non trouvé');
    }
  });

  return httpServer;
}