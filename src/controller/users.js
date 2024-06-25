import { connect } from "../databases"; //objeto conexion
import jwt from "jsonwebtoken";
const claveSecreta = process.env.DATA_SECRET_KEY; 

export const logIn = async (req, res) => {
  try {
    //intenta hacer lo que ...
    //obtener los datos del front
    const { dni, password } = req.body;
    //conectar me con labse de datos, guardo la conexion en cnn
    const cnn = await connect();
    //obtenemos el usuario con el dni
    const [rows] = await cnn.query("SELECT * FROM alumno WHERE dni=?", [dni]);
    //comprobamos que el user existe
    if (rows.length > 0) {
      if (rows[0].pass === password) {
        //que el usuario y la contrase coinciden
        //objeto payload
        const payload = { dni: dni, nombre: rows[0].nombre };
        const token = getToken(payload);
        return res.status(200).header("auth", token).json({ message: "todo ok" });
      } else {
        return res.status(400).json({ succes: false });
      }
    } else {
      return res.status(500).json({ message: "El usuario no existe" }); //el usuario no existe
    }
  } catch (error) {
    console.log("error desde login", error.message);
    //devolver al cliente la respuesta con status, ademas lo voy a acompalar con un json
    return res
      .status(500)
      .json({ succes: false, message: "no se ejecuto el try", error: error.message }); //utilizo el metodo .json({objeto}) para transformar el objeto en json
  }
};

//crear usuarios desde el singup
export const createUsers = async (req, res) => {
  try {
    const { dni, nombre, password } = req.body;

    const cnn = await connect();

    const q = "INSERT INTO alumno ( dni, nombre, pass ) VALUES (?, ? ,?)";
    const valores = [dni, nombre, password];
    const exist = await isExist(dni, "alumno", "dni", cnn);

    if (exist) return res.status(400).json({ message: "El usuario ya existe" });

    const [result] = await cnn.query(q, valores);

    if (result.affectedRows === 1) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(400).json({ success: false });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error });
  }
};

//middleware
export const auth = (req, res, next) => {
  //obtengo el token desde la request/ front
  const token = req.headers["auth"];
  if (!token) return res.status(400).json({ message: "No hay token" }); //si no hay token

  //verificar si el token es valido
  jwt.verify(token, claveSecreta, (error, payload) => {
      if (error) {
        //si el token es invalido
        return res.status(400).json({ message: "el token no es valido" });
      } else {
        //el token es valido
        req.user = payload;
        next();
      }
    }
  );
};

export const getMateriaByID = (req, res) => {
  const user = req.user;
  const listaMaterias = [
    { id: 10, nombre: "so" },
    { id: 11, nombre: "arquitectura" },
    { id: 12, nombre: "web" },
  ];
  return res.json(listaMaterias);
};

export const addMateria = async (req, res) => {
  try {
    const {nombre_materia} = req.body;
    const cnn = await connect();
    const q = "INSERT INTO materia (nombre_materia) VALUES (?)";
    const valores = [nombre_materia];
    const [result] = await cnn.query(q, valores);
    if (result.affectedRows === 1) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(400).json({ success: false });
    }
  } catch (error) {
    return res.status(400).json({success: false, error: error})
  }
}

export const cursar = async (req, res) => {
  try {
    const {dni, id_m} = req.body;
    const cnn = await connect();
    const q = "INSERT INTO cursar (dni, id_m) VALUES(?,?)";
    const valores = [dni, id_m]
    const [rows] = await cnn.query(q, valores);
    if (rows.affectedRows === 1) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(400).json({ success: false });
    }
  } catch (error) {
    return res.status(400).json({success: false, error: error})
  }
}


//funciones privadas
//comprobar que existe el usuario
const isExist = async (value, table, column, conection) => {
  try {
    const q = `SELECT * FROM ${table} WHERE ${column}=?`;
    const [rows] = await conection.query(q, [value]);

    return rows.length > 0;
  } catch (error) {
    console.log(error.message);
  }
};

//generar un token a partir de informacion del usuario
const getToken = (payload) => {
  try {
    const token = jwt.sign(payload, claveSecreta, { expiresIn: "1m" });
    return token;
  } catch (error) {
    console.log("error en el token", error);
  }
};
