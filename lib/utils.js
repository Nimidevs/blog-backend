const crypto = require("crypto");
const jsonwebtoken = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const passport = require('passport')
require("dotenv").config();

const pathToKey = path.join(__dirname, "..", "id_rsa_priv.pem");
const PRIV_KEY = fs.readFileSync(pathToKey, "utf8");

const passphrase = process.env.PASSPHRASE;
const privateKey = crypto.createPrivateKey({
  key: PRIV_KEY,
  format: 'pem',
  type: 'pkcs8',
  passphrase: passphrase
});

function issueJWT(user) {
  const _id = user._id;

  const expiresIn = "1min";

  const payload = {
    sub: _id,
    iat: Date.now(),
  };
  try {
    const signedToken = jsonwebtoken.sign(payload, privateKey, {
      expiresIn: expiresIn,
      algorithm: "RS256",
    });

    return {
      token: "Bearer " + signedToken,
      expires: expiresIn,
    };
  } catch (error) {
    // console.log(error);
    throw new Error(error);
  }
}

module.exports.issueJWT = issueJWT;
