const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { UserCollection, CarbonCollection } = require("./config"); // Import des collections depuis config.js

// Initialisation de l'application Express
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set('view engine', 'ejs');
app.use(express.static("public"));

// Route pour afficher la page d'accueil avec le carrousel et le formulaire
app.get("/", (req, res) => {
    const images = [
        '/images/image1.jpg',
        '/images/image2.jpg',
        '/images/image3.jpg'
    ];
    res.render("home", { images: images }); // Affiche la page home.ejs
});
// Route pour gérer les données du formulaire d'empreinte carbone
app.post("/carbons", async (req, res) => {
  const { distance, transport, passengers } = req.body;

  try {
      // Calcul de l'empreinte carbone
      const emissionRates = {
          car: 0.12, // kg CO2/km
          plane: 0.25,
          train: 0.04,
          bus: 0.05,
      };
      const calculatedCarbon = distance * emissionRates[transport] / passengers;

      // Enregistrement dans la base de données
      const newCarbonEntry = new CarbonCollection({
          distance,
          transport,
          passengers,
          calculatedCarbon,
      });

      await newCarbonEntry.save();
      console.log("Empreinte carbone enregistrée :", newCarbonEntry);

      // Redirection vers la page resultat.ejs avec la donnée calculée
      res.render("resultat", { carbonFootprint: calculatedCarbon.toFixed(2) });
  } catch (error) {
      console.error("Erreur lors de l'enregistrement :", error);
      res.status(500).send("Erreur serveur.");
  }
});


// Route pour afficher la page de contact
app.get('/contact', (req, res) => {
    res.render('contact'); // Affiche contact.ejs
});

// Route pour afficher la page de login
app.get("/login", (req, res) => {
    res.render("login");
});

// Route pour afficher la page d'inscription
app.get("/signup", (req, res) => {
    res.render("signup");
});

// Route pour traiter l'inscription de l'utilisateur
app.post("/signup", async (req, res) => {
    const { username, email, password } = req.body;

    // Vérification si l'email existe déjà
    const existingUser = await UserCollection.findOne({ email: email });
    if (existingUser) {
        return res.status(400).send("Cet email est déjà utilisé.");
    }

    // Vérification si le nom d'utilisateur existe déjà
    const existingName = await UserCollection.findOne({ name: username });
    if (existingName) {
        return res.status(400).send("Ce nom d'utilisateur est déjà pris.");
    }

    // Hashage du mot de passe avant de l'enregistrer
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création d'un nouvel utilisateur
    const newUser = new UserCollection({
        name: username,
        email: email,
        password: hashedPassword
    });

    try {
        await newUser.save(); // Sauvegarde dans MongoDB
        console.log("Utilisateur créé avec succès :", newUser);
        res.redirect("/login"); // Redirection vers la page de login après une inscription réussie
    } catch (error) {
        console.error("Erreur lors de la création de l'utilisateur :", error);
        res.status(500).send("Erreur serveur.");
    }
});

// Démarrer le serveur
const port = 5000;
app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
