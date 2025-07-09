# Innovate 23 Sign in desk

This was a quick app to facitialate a sign in desk for Ryman Healthcare's annual hackatho in 2023.

There was 2 screens, one with a grid of all attendees, and a second larger screen that largly stood empty.

As attendees selected themselves from the "sign in" tablet, and answered a quick photo consent form, thier photo would be displayed on the large screen alongside some welcome text.

A rudemientary admin screen was also added, to allow for setting up the teams ahead of the event, as well as allowing for quick updates to the teams as necessary. This was controlled in a rather loose manner (a boolean in the client side code controlled this).

The backend stored data in [Azure Table Storage](https://learn.microsoft.com/en-us/azure/storage/tables/table-storage-overview), and used [SignalR](https://azure.microsoft.com/en-us/products/signalr-service) to allow for server to client communication.

All servcies were deployed to Azure, runing on a free tier. This incldued:
- Azure static web apps
- Azure function app
- Azure table storage
- Azure SingalR service 

This wasn't meant to be "prodcution ready", it really just needed to be good enough. As such, some code best pratcices aren't followed in this repository. Please don't judge it as if it is hardened.
