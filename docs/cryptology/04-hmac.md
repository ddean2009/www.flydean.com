---
slug: /hmac
---

# 4. HMAC算法

# MAC
在现代的网络中，身份认证是一个经常会用到的功能，在身份认证过程中，有很多种方式可以保证用户信息的安全，而MAC(message authentication code)就是一种常用的方法。

消息认证码是对消息进行认证并确认其完整性的技术。通过使用发送者和接收者之间共享的密钥，就可以识别出是否存在伪装和篡改行为。

MAC是通过MAC算法+密钥+要加密的信息一起计算得出的。

同hash算法（消息摘要）相比，消息摘要只能保证消息的完整性，即该消息摘要B是这个消息A生成的。而MAC算法能够保证消息的正确性，即判断确实发的是消息A而不是消息C。

同公私钥体系相比，因为MAC的密钥在发送方和接收方是一样的，所以发送方和接收方都可以来生成MAC，而公私钥体系因为将公钥和私钥分开，所以增加了不可抵赖性。

MAC有很多实现方式，比较通用的是基于hash算法的MAC，比如今天我们要讲的HMAC。还有一种是基于分组密码的实现，比如(OMAC, CBC-MAC and PMAC)。

# HMAC
HMAC 是Keyed-Hashing for Message Authentication的缩写。HMAC的MAC算法是hash算法，它可以是MD5, SHA-1或者 SHA-256，他们分别被称为HMAC-MD5，HMAC-SHA1， HMAC-SHA256。

HMAC用公式表示：

**H(K XOR opad, H(K XOR ipad, text))**

其中
H：hash算法，比如（MD5，SHA-1，SHA-256）
B：块字节的长度，块是hash操作的基本单位。这里B=64。
L：hash算法计算出来的字节长度。(L=16 for MD5, L=20 for SHA-1)。
K：共享密钥，K的长度可以是任意的，但是为了安全考虑，还是推荐K的长度>B。当K长度大于B时候，会先在K上面执行hash算法，将得到的L长度结果作为新的共享密钥。 如果K的长度<B, 那么会在K后面填充0x00一直到等于长度B。
text： 要加密的内容
opad：外部填充常量，是 0x5C 重复B次。
ipad： 内部填充常量，是0x36 重复B次。
XOR： 异或运算。

计算步骤如下：
 1. 将0x00填充到K的后面，直到其长度等于B。
 2. 将步骤1的结果跟 ipad做异或。
 3. 将要加密的信息附在步骤2的结果后面。
 4. 调用H方法。
 5. 将步骤1的结果跟opad做异或。
 6. 将步骤4的结果附在步骤5的结果后面。
 7. 调用H方法。

# HMAC的应用
hmac主要应用在身份验证中，如下是它的使用过程：
 1.  客户端发出登录请求（假设是浏览器的GET请求）
 2. 服务器返回一个随机值，并在会话中记录这个随机值
 3. 客户端将该随机值作为密钥，用户密码进行hmac运算，然后提交给服务器
 4. 服务器读取用户数据库中的用户密码和步骤2中发送的随机值做与客户端一样的hmac运算，然后与用户发送的结果比较，如果结果一致则验证用户合法。

在这个过程中，可能遭到安全攻击的是服务器发送的随机值和用户发送的hmac结果，而对于截获了这两个值的黑客而言这两个值是没有意义的，绝无获取用户密码的可能性，随机值的引入使hmac只在当前会话中有效，大大增强了安全性和实用性。

# HMAC实现举例

```
/*
** Function: hmac_md5
*/

void
hmac_md5(text, text_len, key, key_len, digest)
unsigned char*  text;                /* pointer to data stream */
int             text_len;            /* length of data stream */
unsigned char*  key;                 /* pointer to authentication key */
int             key_len;             /* length of authentication key */
caddr_t         digest;              /* caller digest to be filled in */

{
        MD5_CTX context;
        unsigned char k_ipad[65];    /* inner padding -
                                      * key XORd with ipad
                                      */
        unsigned char k_opad[65];    /* outer padding -
                                      * key XORd with opad
                                      */
        unsigned char tk[16];
        int i;
        /* if key is longer than 64 bytes reset it to key=MD5(key) */
        if (key_len > 64) {

                MD5_CTX      tctx;

                MD5Init(&tctx);
                MD5Update(&tctx, key, key_len);
                MD5Final(tk, &tctx);

                key = tk;
                key_len = 16;
        }

        /*
         * the HMAC_MD5 transform looks like:
         *
         * MD5(K XOR opad, MD5(K XOR ipad, text))
         *
         * where K is an n byte key
         * ipad is the byte 0x36 repeated 64 times
       * opad is the byte 0x5c repeated 64 times
         * and text is the data being protected
         */

        /* start out by storing key in pads */
        bzero( k_ipad, sizeof k_ipad);
        bzero( k_opad, sizeof k_opad);
        bcopy( key, k_ipad, key_len);
        bcopy( key, k_opad, key_len);

        /* XOR key with ipad and opad values */
        for (i=0; i<64; i++) {
                k_ipad[i] ^= 0x36;
                k_opad[i] ^= 0x5c;
        }
        /*
         * perform inner MD5
         */
        MD5Init(&context);                   /* init context for 1st
                                              * pass */
        MD5Update(&context, k_ipad, 64)      /* start with inner pad */
        MD5Update(&context, text, text_len); /* then text of datagram */
        MD5Final(digest, &context);          /* finish up 1st pass */
        /*
         * perform outer MD5
         */
        MD5Init(&context);                   /* init context for 2nd
                                              * pass */
        MD5Update(&context, k_opad, 64);     /* start with outer pad */
        MD5Update(&context, digest, 16);     /* then results of 1st
                                              * hash */
        MD5Final(digest, &context);          /* finish up 2nd pass */
}
```


更多教程请参考 [flydean的博客](http://www.flydean.com/hmac/)
