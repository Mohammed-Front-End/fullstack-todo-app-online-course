import * as yup from "yup";


export const regusterSchema= yup.object({
  username: yup.string()
  .required("Username is required")
  .min(5,"Username should be at least 5 characters."),
  
  email: yup.string()
  .required("Email is required"),
  // .matches(/^[^$]+@[+@]+\.[+^@ .]{2,}$/,"Not a valid email address."),
  
  password: yup.string()
  .required("Passowrd is required")
  .min(8,"Passowrd should be at least 8 characters."),

}).required();


export const loginSchema= yup.object({

  identifier: yup.string()
  .required("Email is required"),
  // .matches(/^[^$]+@[+@]+\.[+^@ .]{2,}$/,"Not a valid email address."),
  
  password: yup.string()
  .required("Passowrd is required")
  .min(8,"Passowrd should be at least 8 characters."),

}).required();
