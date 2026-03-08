export default class MersenneTwister{
    private N = 624;
    private M = 397;
    private MATRIX_A = 0x9908b0df;
    private UPPER_MASK = 0x80000000;
    private LOWER_MASK = 0x7fffffff;
    
    private mt = new Array(this.N);
    private mti = this.N + 1;
  
    constructor(seed: number | undefined) {
        if (!seed) {
            seed = new Date().getTime();
        }

        this.init_genrand(seed);
    }  
    
    private init_genrand(s: number) {
        this.mt[0] = s >>> 0;
        for (this.mti=1; this.mti<this.N; this.mti++) {
            s = this.mt[this.mti-1] ^ (this.mt[this.mti-1] >>> 30);
            this.mt[this.mti] = (((((s & 0xffff0000) >>> 16) * 1812433253) << 16) + (s & 0x0000ffff) * 1812433253) + this.mti;
            this.mt[this.mti] >>>= 0;
        }
    }
    
    init_by_array(init_key: number[], key_length: number) {
        this.init_genrand(19650218);
        
        let i = 1;
        let j = 0;
        let k = this.N > key_length ? this.N : key_length;

        for (; k; k--) {
            let s = this.mt[i-1] ^ (this.mt[i-1] >>> 30)
            this.mt[i] = (this.mt[i] ^ (((((s & 0xffff0000) >>> 16) * 1664525) << 16) + ((s & 0x0000ffff) * 1664525))) + init_key[j] + j;
            this.mt[i] >>>= 0;
            i++; 
            j++;
            if (i >= this.N) { 
                this.mt[0] = this.mt[this.N-1]; 
                i=1; 
            }

            if (j>=key_length) {
                j=0;
            }
        }

        for (k = this.N-1; k; k--) {
            let s = this.mt[i-1] ^ (this.mt[i-1] >>> 30);
            this.mt[i] = (this.mt[i] ^ (((((s & 0xffff0000) >>> 16) * 1566083941) << 16) + (s & 0x0000ffff) * 1566083941)) - i;
            this.mt[i] >>>= 0;
            i++;
            if (i >= this.N) { 
                this.mt[0] = this.mt[this.N-1]; 
                i=1; 
            }
        }
    
        this.mt[0] = 0x80000000;
    }
    
    /* generates a random number on [0,0xffffffff]-interval */
    genrand_int32() {
        let y;
        let mag01 = new Array(0x0, this.MATRIX_A);
        /* mag01[x] = x * MATRIX_A  for x=0,1 */
    
        if (this.mti >= this.N) { /* generate N words at one time */
            let kk;
        
            if (this.mti == this.N + 1)   /* if init_genrand() has not been called, */
                this.init_genrand(5489); /* a default initial seed is used */
        
            for (kk = 0; kk < this.N - this.M; kk++) {
                y = (this.mt[kk] & this.UPPER_MASK) | (this.mt[kk + 1] & this.LOWER_MASK);
                this.mt[kk] = this.mt[kk + this.M] ^ (y >>> 1) ^ mag01[y & 0x1];
            }

            for (; kk < this.N - 1; kk++) {
                y = (this.mt[kk] & this.UPPER_MASK) | (this.mt[kk + 1] & this.LOWER_MASK);
                this.mt[kk] = this.mt[kk + (this.M - this.N)] ^ (y >>> 1) ^ mag01[y & 0x1];
            }

            y = (this.mt[this.N - 1] & this.UPPER_MASK) | (this.mt[0] & this.LOWER_MASK);
            this.mt[this.N - 1] = this.mt[this.M - 1] ^ (y >>> 1) ^ mag01[y & 0x1];
        
            this.mti = 0;
        }
    
        y = this.mt[this.mti++];
    
        y ^= (y >>> 11);
        y ^= (y << 7) & 0x9d2c5680;
        y ^= (y << 15) & 0xefc60000;
        y ^= (y >>> 18);
    
        return y >>> 0;
    }
    
    /* generates a random number on [0,0x7fffffff]-interval */
    genrand_int31() {
        return (this.genrand_int32() >>> 1);
    }
    
    /* generates a random number on [0,1]-real-interval */
    genrand_real1() {
        return this.genrand_int32()*(1.0/4294967295.0); 
        /* divided by 2^32-1 */ 
    }
    
    /* generates a random number on [0,1)-real-interval */
    random() {
        return this.genrand_int32()*(1.0/4294967296.0); 
        /* divided by 2^32 */
    }
    
    /* generates a random number on (0,1)-real-interval */
    genrand_real3() {
        return (this.genrand_int32() + 0.5)*(1.0/4294967296.0); 
        /* divided by 2^32 */
    }
    
    /* generates a random number on [0,1) with 53-bit resolution*/
    genrand_res53() { 
        let a = this.genrand_int32() >>> 5, b = this.genrand_int32() >>> 6; 
        return(a * 67108864.0 + b)*(1.0/9007199254740992.0);
    } 
}