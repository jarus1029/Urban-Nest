// import * as config from '../config.js'
const style = `
background:#eee;
padding:20px;
border-radius:20px;
`;

export const emailTemplate = (email, content, replyTo, subject) => {
    const EMAIL_FROM='"Suraj Kumar" <surajkumar1029ss@gmail.com>';
    return {
        Source: EMAIL_FROM,
        Destination:
        {
            ToAddresses: [email],
        },
        Message: {
            Body: {
                Html: {
                    Charset: "UTF-8",
                    Data:
                        `<html>
                        <div style="${style}">
                             <h1>Welcome to Urban_nest app</h1>
                             ${content}
                             <p>&copy; ${new Date().getFullYear()}</p>
                        </div>
                    </html>`
                    ,
                },
            },
            Subject: {
                Charset: "UTF-8",
                Data: subject,
            },
        },

    }
}