Added forget,update and reset password
Updated authRoutes.js 
Updated authController.js
Updated user.js 
i don't think i updated db.js but i'll copy just to be safe
cp -r sdcard/userland/ocoam-backend/controllers/authController.js ~/ ocoam-backend/controllers/authController.js
I.m about to change the method to only using one login for all and maybe the same with signup...
The idea of making signup for each was never and will never be intent
we will verify the token to make sure the user exists before sending the status code or responses