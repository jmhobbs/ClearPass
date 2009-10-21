/*
* Modified to namespace functions and format source.
*
* Changes Copyright (c) 2009, John Hobbs
* All rights reserved.
*
* Redistribution and use in source and binary forms, with or without
* modification, are permitted provided that the following conditions
* are met:
* 1. Redistributions of source code must retain the above copyright
*    notice, this list of conditions and the following disclaimer.
* 2. Redistributions in binary form must reproduce the above copyright
*    notice, this list of conditions and the following disclaimer in the
*    documentation and/or other materials provided with the distribution.
* 3. Neither the name of the copyright holder nor the names of contributors
*    may be used to endorse or promote products derived from this software
*    without specific prior written permission.
*
* ======================================================================
*
* THIS SOFTWARE IS PROVIDED BY THE AUTHORS ''AS IS'' AND ANY EXPRESS
* OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
* WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
* ARE DISCLAIMED.  IN NO EVENT SHALL THE AUTHORS OR CONTRIBUTORS BE
* LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
* CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
* SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR
* BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
* WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
* OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
* EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/*
* A JavaScript implementation of the SHA256 hash function.
*
* FILE:	sha256.js
* VERSION:	0.8
* AUTHOR:	Christoph Bichlmeier <informatik@zombiearena.de>
*
* NOTE: This version is not tested thoroughly!
*
* Copyright (c) 2003, Christoph Bichlmeier
* All rights reserved.
*
* Redistribution and use in source and binary forms, with or without
* modification, are permitted provided that the following conditions
* are met:
* 1. Redistributions of source code must retain the above copyright
*    notice, this list of conditions and the following disclaimer.
* 2. Redistributions in binary form must reproduce the above copyright
*    notice, this list of conditions and the following disclaimer in the
*    documentation and/or other materials provided with the distribution.
* 3. Neither the name of the copyright holder nor the names of contributors
*    may be used to endorse or promote products derived from this software
*    without specific prior written permission.
*
* ======================================================================
*
* THIS SOFTWARE IS PROVIDED BY THE AUTHORS ''AS IS'' AND ANY EXPRESS
* OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
* WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
* ARE DISCLAIMED.  IN NO EVENT SHALL THE AUTHORS OR CONTRIBUTORS BE
* LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
* CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
* SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR
* BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
* WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
* OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
* EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

var SHA256 = {

	/* SHA256 logical functions */
	rotateRight: function (n,x) {
		return ((x >>> n) | (x << (32 - n)));
	},

	choice: function (x,y,z) {
		return ((x & y) ^ (~x & z));
	},

	majority: function (x,y,z) {
		return ((x & y) ^ (x & z) ^ (y & z));
	},

	Sigma0: function (x) {
		return (SHA256.rotateRight(2, x) ^ SHA256.rotateRight(13, x) ^ SHA256.rotateRight(22, x));
	},

	Sigma1: function (x) {
		return (SHA256.rotateRight(6, x) ^ SHA256.rotateRight(11, x) ^ SHA256.rotateRight(25, x));
	},

	sigma0: function (x) {
		return (SHA256.rotateRight(7, x) ^ SHA256.rotateRight(18, x) ^ (x >>> 3));
	},

	sigma1: function (x) {
		return (SHA256.rotateRight(17, x) ^ SHA256.rotateRight(19, x) ^ (x >>> 10));
	},

	expand: function (W, j) {
		return (W[j&0x0f] += SHA256.sigma1(W[(j+14)&0x0f]) + W[(j+9)&0x0f] + SHA256.sigma0(W[(j+1)&0x0f]));
	},

	/* Hash constant words K: */
	K256: new Array(
		0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
		0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
		0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
		0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
		0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
		0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
		0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
		0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
		0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
		0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
		0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
		0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
		0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
		0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
		0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
		0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
	),

	/* global arrays */
	ihash: null,
	count: null,
	buffer: null,

	hex_digits: "0123456789abcdef",

	/* Add 32-bit integers with 16-bit operations (bug in some JS-interpreters: overflow) */
	safe_add: function (x, y) {
		var lsw = (x & 0xffff) + (y & 0xffff);
		var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
		return (msw << 16) | (lsw & 0xffff);
	},

	/* Initialise the SHA256 computation */
	init: function () {
		SHA256.ihash = new Array(8);
		SHA256.count = new Array(2);
		SHA256.buffer = new Array(64);
		SHA256.count[0] = SHA256.count[1] = 0;
		SHA256.ihash[0] = 0x6a09e667;
		SHA256.ihash[1] = 0xbb67ae85;
		SHA256.ihash[2] = 0x3c6ef372;
		SHA256.ihash[3] = 0xa54ff53a;
		SHA256.ihash[4] = 0x510e527f;
		SHA256.ihash[5] = 0x9b05688c;
		SHA256.ihash[6] = 0x1f83d9ab;
		SHA256.ihash[7] = 0x5be0cd19;
	},

	/* Transform a 512-bit message block */
	transform: function () {
		var a, b, c, d, e, f, g, h, T1, T2;
		var W = new Array(16);

		/* Initialize registers with the previous intermediate value */
		a = SHA256.ihash[0];
		b = SHA256.ihash[1];
		c = SHA256.ihash[2];
		d = SHA256.ihash[3];
		e = SHA256.ihash[4];
		f = SHA256.ihash[5];
		g = SHA256.ihash[6];
		h = SHA256.ihash[7];

					/* make 32-bit words */
		for(var i=0; i<16; i++)
			W[i] = ((SHA256.buffer[(i<<2)+3]) | (SHA256.buffer[(i<<2)+2] << 8) | (SHA256.buffer[(i<<2)+1] << 16) | (SHA256.buffer[i<<2] << 24));

		for(var j=0; j<64; j++) {
			T1 = h + SHA256.Sigma1(e) + SHA256.choice(e, f, g) + SHA256.K256[j];

			if(j < 16) T1 += W[j];
			else T1 += SHA256.expand(W, j);

			T2 = SHA256.Sigma0(a) + SHA256.majority(a, b, c);
			h = g;
			g = f;
			f = e;
			e = SHA256.safe_add(d, T1);
			d = c;
			c = b;
			b = a;
			a = SHA256.safe_add(T1, T2);
		}

		/* Compute the current intermediate hash value */
		SHA256.ihash[0] += a;
		SHA256.ihash[1] += b;
		SHA256.ihash[2] += c;
		SHA256.ihash[3] += d;
		SHA256.ihash[4] += e;
		SHA256.ihash[5] += f;
		SHA256.ihash[6] += g;
		SHA256.ihash[7] += h;
	},

	/* Read the next chunk of data and update the SHA256 computation */
	update: function (data, inputLen) {
		var i, index, curpos = 0;

		/* Compute number of bytes mod 64 */
		index = ((SHA256.count[0] >> 3) & 0x3f);
		var remainder = (inputLen & 0x3f);

		/* Update number of bits */
		if ((SHA256.count[0] += (inputLen << 3)) < (inputLen << 3)) SHA256.count[1]++;
		SHA256.count[1] += (inputLen >> 29);

		/* Transform as many times as possible */
		for(i=0; i+63<inputLen; i+=64) {
			for(var j=index; j<64; j++)
				SHA256.buffer[j] = data.charCodeAt(curpos++);
			SHA256.transform();
			index = 0;
		}

		/* Buffer remaining input */
		for(var j=0; j<remainder; j++)
			SHA256.buffer[j] = data.charCodeAt(curpos++);
	},

	/* Finish the computation by operations such as padding */
	final: function () {
		var index = ((SHA256.count[0] >> 3) & 0x3f);
		SHA256.buffer[index++] = 0x80;
		if(index <= 56) {
			for(var i=index; i<56; i++)
				SHA256.buffer[i] = 0;
		}
		else {
			for(var i=index; i<64; i++)
				SHA256.buffer[i] = 0;
			SHA256.transform();
			for(var i=0; i<56; i++)
				SHA256.buffer[i] = 0;
		}
		SHA256.buffer[56] = (SHA256.count[1] >>> 24) & 0xff;
		SHA256.buffer[57] = (SHA256.count[1] >>> 16) & 0xff;
		SHA256.buffer[58] = (SHA256.count[1] >>> 8) & 0xff;
		SHA256.buffer[59] = SHA256.count[1] & 0xff;
		SHA256.buffer[60] = (SHA256.count[0] >>> 24) & 0xff;
		SHA256.buffer[61] = (SHA256.count[0] >>> 16) & 0xff;
		SHA256.buffer[62] = (SHA256.count[0] >>> 8) & 0xff;
		SHA256.buffer[63] = SHA256.count[0] & 0xff;
		SHA256.transform();
	},

	/* Split the internal hash values into an array of bytes */
	encode_bytes: function () {
					var j=0;
					var output = new Array(32);
		for(var i=0; i<8; i++) {
			output[j++] = ((SHA256.ihash[i] >>> 24) & 0xff);
			output[j++] = ((SHA256.ihash[i] >>> 16) & 0xff);
			output[j++] = ((SHA256.ihash[i] >>> 8) & 0xff);
			output[j++] = (SHA256.ihash[i] & 0xff);
		}
		return output;
	},

	/* Get the internal hash as a hex string */
	encode_hex: function () {
		var output = new String();
		for(var i=0; i<8; i++) {
			for(var j=28; j>=0; j-=4)
				output += SHA256.hex_digits.charAt((SHA256.ihash[i] >>> j) & 0x0f);
		}
		return output;
	},

	/* Main function: returns a hex string representing the SHA256 value of the given data */
	digest: function (data) {
		SHA256.init();
		SHA256.update(data, data.length);
		SHA256.final();
		return SHA256.encode_hex();
	},

	/* test if the JS-interpreter is working properly */
	self_test: function () { return SHA256.digest("message digest") == "f7846f55cf23e14eebeab5b4e1550cad5b509e3348fbc4efa3a1413d393cb650"; }
} // var SHA256