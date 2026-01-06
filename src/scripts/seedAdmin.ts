import { prisma } from "../lib/prisma";
import { UserRole } from "../middleware/auth";

async function seedAdmin() {
  try {
    console.log("**** hello world");
    const adminData = {
      name: "admin3",
      email: "admin3@gmail.com",
      role: UserRole.ADMIN,
      password: "admin1234"
    };
    console.log(adminData);

    const existingUser = await prisma.user.findUnique({
        where:{
            email:adminData.email
        }
    })

    if(existingUser) throw new Error('User already exists')
    
    const signUpAdmin = await fetch("http://localhost:3000/api/auth/sign-up/email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Origin: "http://localhost:4000",
            },
            body: JSON.stringify(adminData)
        })
    console.log(signUpAdmin);
    if(signUpAdmin.ok){
        await prisma.user.update({ 
            where:{
                email:adminData.email
            },
            data:{
                emailVerified:true
            }
        })
    }



  } catch (error) {
    console.error(error);
  }
}

seedAdmin();
