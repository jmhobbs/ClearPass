What is ClearPass?
==================

ClearPass is a web based password storage system based on the host-proof design
pattern.

All encryption and decryption is done on the local system, and content is never
transmitted in plaintext.  The server has no clue what you password is, assuring
that if it is comprimised, your information will not be.

How?
====

All sensitive information in ClearPass is encrypted in 256-bit AES in CBC mode,
using the OpenSSL compatible
[Gibberish AES](http://github.com/markpercival/gibberish-aes) library by Mark
Percival.

To be prevent MITM and replay attacks, all messages from client to server are
wrapped with a SHA256 based MAC scheme.

API?
====

Unlike previous versions of ClearPass (and formerly, BlowPass) the driving
feature will _not_ be the front end, but rather the API.  The vision is that by
focusing on the API we can be more flexible and create something that works for
a web front end, desktop apps, browser plugins, etc.

When?
=====

This is all still in early stages, so if you need something now, go grab the
last generation source from http://www.clearpass.org/dev/

Who?
====

ClearPass in all forms is maintained by [John Hobbs](http://www.velvetcache.org/)
 and [Little Filament](http://www.littlefilament.com/)