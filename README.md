Configuration Profile Generator
====================================

This is a simple web-based application that allows you to generate a configuration profile for your mobile device. The configuration profile is in the form of a .mobileconfig file, which can be used to configure various settings on your device, such as APN, proxy, and DNS.

Usage
-----

To use the application, simply open the index.html file in a web browser. You will see a form with a dropdown menu to select your carrier. Choose your carrier and click the "Generate Configuration Profile" button. The application will generate a .mobileconfig file and prompt you to download it.

Once you have downloaded the file, you can email it to yourself and open it on your mobile device to install the configuration profile.

Customization
-------------

The application includes some basic CSS styles to make it look presentable, but you are free to customize the styles to suit your needs. The CSS is included in a `<style>` tag in the `<head>` of the HTML file.

The application also uses the Bootstrap CSS framework to provide some of the basic layout and styling. The Bootstrap CSS and JavaScript files are included from a CDN, but you can also download them and include them locally if you prefer.

The JavaScript code that handles the form submission and generates the configuration profile is included in a `<script>` tag at the bottom of the HTML file. You are free to modify this code as well, but be aware that it may break the application if you are not careful.

License
-------

This application is licensed under the MIT License. See the LICENSE file for more information.
