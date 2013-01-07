    
/* Collect entropy from mouse motion and key press events
 * Note that this is coded to work with either DOM2 or Internet Explorer
 * style events.
 * We don't use every successive mouse movement event.
 * Instead, we use some bits from random() to determine how many
 * subsequent mouse movements we ignore before capturing the next one.
 * rc4 is used as a mixing function for the captured mouse events.  
 *
 * mouse motion event code originally from John Walker
 * key press timing code thanks to Nigel Johnstone
 */

var oldKeyHandler;    // For saving and restoring key press handler in IE4
var keyRead = 0;
var keyNext = 0;
var keyArray = new Array(256);
	
var mouseMoveSkip = 0; // Delay counter for mouse entropy collection
var oldMoveHandler;    // For saving and restoring mouse move handler in IE4
var mouseRead = 0;
var mouseNext = 0;
var mouseArray = new Array(256);

// ----------------------------------------

var s=new Array(256);
var x, y;

function rc4Init()
{
 var i, t;
 var key = new Array(256);

 for(i=0; i<256; i++)
 {
  s[i]=i;
  key[i] = randomByte()^timeByte();
 }

 y=0;
 for(i=0; i<2; i++)
 {
  for(x=0; x<256; x++)
  {
   y=(key[i] + s[x] + y) % 256;
   t=s[x]; s[x]=s[y]; s[y]=t;
  }
 }
 x=0;
 y=0;
}

function rc4Next(b)
{
 var t, x2;

 x=(x+1) & 255; 
 y=(s[x] + y) & 255;
 t=s[x]; s[x]=s[y]; s[y]=t;
 return (b ^ s[(s[x] + s[y]) % 256]) & 255; 
}

// ----------------------------------------
    

function randomByte() { return Math.round(Math.random()*255)&255; }
function timeByte() { return ((new Date().getTime())>>>2)&255; }

function keyByte() { return ((keyRead++)%keyNext)^timeByte(); }


function mouseByte() { return ((mouseRead++)%mouseNext)^rc4Next((x++)&255)^rc4Next(timeByte()); }

rc4Init();

exports.keyByte = keyByte;
exports.mouseByte = mouseByte;
