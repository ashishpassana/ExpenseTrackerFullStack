const user = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerUser = async(req,res)=>{
  const { name , email , password } = req.body;

  const existingUser = await user.findOne({email});

  if(existingUser){
    return res.status(400).json({
      message:"User already exists"
    });
  }

  const hashedPassword = await bcrypt.hash(password,10);

  const newUser = await user.create({
    name,
    email,
    password : hashedPassword,
  });

  res.status(201).json({
    message: "User registered successfully",
    user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email
    }
});
};

const loginUser = async (req,res) => {
  const { email , password } = req.body;

  const existingUser = await user.findOne({email});

  if(!existingUser){
    return res.status(404).json({
      message: "User not found",
    });
  }

  const isPasswordCorrect = await bcrypt.compare(password,existingUser.password);

  if(!isPasswordCorrect){
    return res.status(401).json({
      message: "Invalid credentials",
    });
  }

  const token = jwt.sign(
    {
      id: existingUser._id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );

  res.status(200).json({
    message:"Login successful",
    token,
    user: {
      name: existingUser.name,
    },
  });

};


module.exports = {
  registerUser,
  loginUser,
};
