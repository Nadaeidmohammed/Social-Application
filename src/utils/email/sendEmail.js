import nodemailer from "nodemailer"
export const sendEmail =async({to,subject,html})=>{
    const transporter= nodemailer.createTransport({
        service:"gmail",
        port:465,
        secure:true,
        auth:{
            user:process.env.EMAIL,
            pass:process.env.PASS,
        },
        tls: {
            rejectUnauthorized: false,
          },
        
    });
    const info=await transporter.sendMail({
        from:`"Social Media Application "<${process.env.EMAIL}>`,
        to,
        subject,
        html
    })
    return info.rejected.length===0?true:false;
}
export const subject={
    verifyEmail:"Verify Email",
    resetPassword:"Reset Password",
    updateEmail :"Update Email"
}
