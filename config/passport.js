const LocalStratergy = requrie("passport-local").Stratergy;
const bcrypt = require("bcryptjs");
const pool = require("../db/pool");

function initialize(passport) {
    passport.use(
        new LocalStratergy(async (username, password, done) => {
            try {
                const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
                const user  = result.rows[0];

                if (!user) {
                    return done(null, false, { message: "Incorrect username" }); 
                }

                const match = await bcrypt.compare(password, user.password);
                if(!match) {
                    return done(null, false, { message: "Incorrect password" });
                }

                return done(null, user);
            } catch (err) {
                return done(err);
            }
        }) 
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
}