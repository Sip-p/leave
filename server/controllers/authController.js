 import bcrypt from "bcrypt";
import User from '../models/User.js'
import jwt from "jsonwebtoken"
// Signup
export const signup = async (req, res) => {
  const { name, email, password, role,managerEmail } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }
  if(role==="employee" && !managerEmail){
    return res.status(400).json({message:"Manager email is required"})
  }

  try{
   const existingUser=await User.findOne({email})
if(existingUser){
  return res.status(400).json({message:"Email already exists"});
}
let manager = null;

if (role === "employee") {
  manager = await User.findOne({
    email: managerEmail,
    role: "manager",
  });

  if (!manager) {
    return res.status(400).json({
      message: "Manager not found with this email",
    });
  }
}

const salt=10;
const hashedPassword=await bcrypt.hash(password,salt);

//Creating new User
const newUser=await User.create({
  name,email,password:hashedPassword,role,managerEmail:role==="employee" ? managerEmail:null
})

 res.status(201).json({
      message: "User Registered Successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      manager: manager
        ? {
            id: manager._id,
            name: manager.name,
            email: manager.email,
            role: manager.role,
          }
        : null,
    });
   
  } catch (error) {
    console.log("  Server Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//  LOGIN
export const login = async(req, res) => {
  const { email, password  } = req.body;
 
  if (!email || !password  ) {
    console.log("1")
    return res.status(400).json({ message: "All fields are required" });
  }

 try {
  const existUser=await User.findOne({email});

  if(!existUser){
     console.log("1")
    return res.status(400).json({message:"invalid credential"})
  }
const isMatch=await bcrypt.compare(password,existUser.password);
if(!isMatch){
    return res.status(400).json({message:"invalid credential"})
}

const token = jwt.sign(
  { id: existUser._id },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);
res.status(200).json({
      message: "Login successful",
      token,
     user: {
  id: existUser._id,
  name: existUser.name,
  email: existUser.email,
  role: existUser.role,    
}
,
    });
 } catch (error) {
    console.log("  Server Error:", error);
    res.status(500).json({ message: "Server error" });
  }
   
 

     
  
};
