import passport from "passport";
import local from "passport-local";
import jwt, { ExtractJwt } from "passport-jwt";
import GitHubStrategy from "passport-github2";
import { createHash, isValidPassword } from "../utils/functionsUtil.js";
import CartManager from "../dao/MongoDB/CartManagerDB.js";
import config from "./config.js";
import UserManager from "../dao/MongoDB/UserManagerDB.js";

const userService = new UserManager();

const initializePassport = async () => {
  const localStrategy = local.Strategy;
  const JWTStrategy = jwt.Strategy;
  const CartService = new CartManager();

  const admin = {
    first_name: "Coder",
    last_name: "Admin",
    email: config.ADMIN_EMAIL,
    password: config.ADMIN_PASSWORD,
    role: "admin",
  };

  const CLIENT_ID = config.CLIENT_ID;
  const SECRET_ID = config.SECRET_ID;
  const githubCallbackURL = config.GITHUB_CALLBACK_URL;

  const cookieExtractor = (req) => {
    let token;
    if (req && req.cookies) {
      token = req.cookies["coderCookieToken"];
    }

    return token;
  };

  //Registro
  passport.use(
    "register",
    new localStrategy({ passReqToCallback: true, usernameField: "email", session: false }, async (req, username, password, done) => {
      const { first_name, last_name, email, age } = req.body;
      try {
        if (!first_name || !last_name || !email || !age) {
          return done(null, false, { message: "Faltan campos por completar" });
        }

        let exist = await userService.getUserByEmail(username);
        if (exist) {
          return done(null, false, { message: "El email ya está registrado" });
        }

        const newUser = {
          first_name,
          last_name,
          email,
          age,
          cart: await CartService.createCart(),
          password: createHash(password),
        };

        let result = await userService.createUser(newUser);

        // Devolver el usuario creado
        return done(null, result);
      } catch (error) {
        console.error("Error en la estrategia de Passport:", error);
        return done(error);
      }
    })
  );

  //Login
  passport.use(
    "login",
    new localStrategy(
      {
        usernameField: "email",
        session: false,
      },
      async (username, password, done) => {
        try {
          if (username === config.ADMIN_EMAIL && password === config.ADMIN_PASSWORD) {
            const adminUser = admin;
            return done(null, adminUser);
          }

          const user = await userService.getUserByEmail(username);
          if (!user) {
            const errorMessage = "¡Inicio de sesión fallido! El usuario no existe\n Por favor, verifica tu correo electrónico e intenta nuevamente.";
            return done(null, false, { message: errorMessage });
          }

          if (!isValidPassword(user, password)) {
            const errorMessage = "¡Inicio de sesión fallido! La contraseña es incorrecta\n Por favor, verifica tu contraseña e intenta nuevamente.";
            return done(null, false, { message: errorMessage });
          }

          if (!user.cart) {
            user.cart = await CartService.createCart();
            await userService.updateUser(user);
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  //Github
  passport.use(
    "github",
    new GitHubStrategy(
      {
        clientID: CLIENT_ID,
        clientSecret: SECRET_ID,
        callbackURL: githubCallbackURL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile._json.email;

          let user = await userService.getUserByEmail(email);
          if (!user) {
            let newUser = {
              first_name: profile._json.login,
              last_name: " ",
              email: email || `${profile._json.login}@github.com`,
              password: "",
              age: 0,
              role: "user",
              cart: await CartService.createCart(),
            };
            let result = await userService.createUser(newUser);
            done(null, result);
          } else {
            if (!user.cart) {
              user.cart = await CartService.createCart();
              await userService.updateUser(user);
            }

            done(null, user);
          }
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  //Login con JWT
  passport.use(
    "jwt",
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
        secretOrKey: config.JWT_SECRET,
      },
      async (jwt_payload, done) => {
        try {
          if (jwt_payload.email === admin.email) {
            const adminUser = admin;
            return done(null, adminUser);
          }

          //en caso de que no se encuentre un carrito creado en el usuario registrado
          let user = await userService.getUserById(jwt_payload._id);
          if (!user) {
            return done(null, false);
          }

          if (!user.cart) {
            user.cart = await CartService.createCart();
            await userService.updateUser(user._id, user);
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    if (user.email === admin.email) {
      done(null, "admin");
    } else {
      done(null, user._id);
    }
  });

  passport.deserializeUser(async (id, done) => {
    if (id === "admin") {
      done(null, admin);
    } else {
      let user = await userService.getUserById(id);
      done(null, user);
    }
  });
};

export default initializePassport;
