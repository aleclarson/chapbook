# External Web Fonts

Creating a good font stack is difficult because there are very few typefaces you can count on a majority of your players having installed. Fortunately, you aren't limited to what your players happen to have installed--instead, you can use web fonts.

## Using Google Fonts

Google provides a wide variety of freely-usable fonts through their [Google Fonts][google-fonts] service. To use Google Fonts in your story, first find the embed code for the families you wish to use:

<p style="text-align: center">
<img src="google-font.png" width="300" height="198" alt="Google Fonts screenshot">
</p>

Copy the embed code that Google Fonts offers you, i.e. `<link href="https://fonts.googleapis.com/css?family=Open+Sans" rel="stylesheet">
`, and set the variable `config.style.googleFont` to it in your first passage. You can then use the font name anywhere in the rest of `config.style` as usual:

```
config.style.googleFont: '<link href="https://fonts.googleapis.com/css?family=Open+Sans" rel="stylesheet">'
config.style.page.font: 'Open Sans/sans-serif 18'
--
Welcome aboard the U.S.S. Hood.
```

Note that because `config.style.googleFont` is a string, you must put single quotes around its value. (It's much easier to type single quotes here, since the embed code has double quotes in it.)

## Using Adobe Typekit Fonts

Adobe Typekit serves a similar purpose to Google Fonts, but most of its collection requires an Adobe Creative Cloud subscription to use. That said, it does permit free use of some of its font families.

Once you've assembled a kit--Adobe's terminology for one or more font families you plan to use--find its embed code in Typekit.

<p style="text-align: center">
<img src="typekit-font.png" width="300" height="152" alt="Typekit screenshot">
</p>

Copy the default code, i.e. `<link rel="stylesheet" href="https://use.typekit.net/abcdefgh.css">`, and set the variable `config.style.typekitFont` to it in your first passage. As with Google Fonts, you can then use the font name anywhere in the rest of `config.style`.

```
config.style.typekitFont: '<link rel="stylesheet" href="https://use.typekit.net/abdefgh.css">'
config.style.page.font: 'Open Sans/sans-serif 18'
--
Welcome aboard the U.S.S. Hood.
```

## Other Web Fonts

You can also use web fonts separately from a cloud service. Please make sure to check the license for the font; it's not uncommon, for example, to be required to pay a certain fee to use a font for personal use, but a different for use on the web, or in an app.

To include a font directly by URL, add two properties to `config.style.fonts`:

```
config.style.fonts.leagueSpartan.url: 'league-spartan.woff2'
config.style.fonts.leagueSpartan.name: 'League Spartan'
config.style.page.font: 'League Spartan/sans-serif 16'
--
It is the year 1969, and you are walking on the moon.
```

Chapbook can't infer the name of the font from the `url` property, so you must tell it what it is.

[google-fonts]: https://fonts.google.com