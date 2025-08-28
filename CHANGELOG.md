Added forget,update and reset password
Updated authRoutes.js 
Updated authController.js
Updated user.js 
i don't think i updated db.js but i'll copy just to be safe
cp -r sdcard/userland/ocoam-backend/controllers/authController.js ~/ ocoam-backend/controllers/authController.js
I.m about to change the method to only using one login for all and maybe the same with signup...
The idea of making signup for each was never and will never be intent
we will verify the token to make sure the user exists before sending the status code or responses

Ok let's create the library frontend..  it's in vite+react use tailwind for styles and framer-motion for animation.. i use react router dom too there is a sidebar so i'll send it to u just for context like to know the way you'd style and format the library page.. the theme should be green and earthy vibe since it's for a nigerian traditional medicine school.. the api url is in .env saved as VITE_API_URLso yh since yk the backend. frontend should be cake.. we are not creating just 1 page but the whole library system.. so from the places that list all the libraries to the things inside the library to the sction to delete for mderators and the section to view and shi for users.. please confirm if what i say is ginna be what u do by summarizing.. so that i'll know were on the same page befor u code