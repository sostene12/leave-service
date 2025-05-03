import nodemailer from "nodemailer";
import dotenv from "dotenv"


dotenv.config()

const mailer = async (info, action) =>{

    const transporter = nodemailer.createTransport({
        service:'gmail',
        auth:{
            user:process.env.SEND_MAIL,
            pass:process.env.PASS_MAIL
        },
        tls: {
            rejectUnauthorized: false
          }

    });

    
    let subject;
    let emailto;
    let composition;

    switch(action){

        case "createrequest" :
            subject = "Request Received";
            emailto = info.email;
            composition = `<p>
                your Request sent successfully!!!
            </p>`;

            break;
            case "CreateUser":
                 subject="account";
                 emailto = info.email;
                 composition = `<p>
                 your account created successfully!
                 to verify your account 
                 <a href='https://electronic-shop.onrender.com/api/auth/verifyemail/${info.emailToken}'>click here</a>
             </p>`;
             break;

             case "confirm":
                 subject="user accepted";
                 emailto = info.email;
                 composition = `<p>
                 your request accepted you are now our partner this is your credential <br/>
                 <span>username: </span><h4>${info.username}</h4><span>password: </span> <h4>${info.password}</h4>
             </p>`;
             break;
             case "order":
                 subject="Order ";
                 emailto = info.email;
                 composition = `<p>
                 your order has been received
             </p>`;
             break;
            default:
                subject ="";
                break;
    }

    const mailOptions = {
        from : `Leave Management ${process.env.SEND_MAIL}`,
        to : emailto,
        subject,
        html:composition,
    };
    try{
        const sendEmail = transporter.sendMail(mailOptions, (err,info)=>{
            
            return sendEmail
        });
        
    }catch(error){
        return error
    }


}

export default mailer