//Sample on the bernoulli distribution
function BernoulliDist(p) {
    if (Math.random() <= p) {
        return 1;
    }
    return 0;
}

//Sample on the binomial disttribution
function BinomialDist(n, p) {

    if (n < 120) {
        var success = 0;
        for (var i = 0; i < n; i++) {
            success += BernoulliDist(p);
        }
        return success;
    } else {
        var u = n * p;
        var sigma = Math.pow(u * (1 - p), 0.5);
        var sample = -1;

        while (sample < 0 || sample > n) {
            sample = Math.ceil(NormalDist(u, sigma) - 0.5);
        }
        return sample;
    }
}

//Sample on the exponential distribution
function ExponentialDist(u) {
    return -u * Math.log(1 - Math.random());
}

//Sample on the geometric distribution
function GeometricDist(p) {
    var sample = -1;
    while (sample < 0) {
        sample = Math.ceil((Math.log(1 - Math.random()) / Math.log(1 - p)) - 1);
    }
    return sample;
}

//Sample on the hypergeometric distribution
function HyperGeometricDist(N, n, m) {

    if (N <= 100) {
        var u = Math.random();
        var p = 0;
        var x = -1;
        var denom = 1 / Math2.Combinations(N, n);
        while (p < u) {
            x++;
            p += Math2.Combinations(m, x) * Math2.Combinations(N - m, n - x) * denom;
        }
        return x;
    } else {
        var shift = .5;

        var u = n * m / N;
        var sigma = Math.pow(u * (N - m) * (N - n) / (N * (N - 1)), 0.5)
        var sample = -1;

        while (sample < 0) {
            sample = Math.ceil(NormalDist(u, sigma) - shift);
        }
        return sample;
    }
}

//Sample on the negative binomial distribution
//Note: returns the number of failures until r successes
function NegativeBinomialDist(r, p) {
    var u = Math.random();
    p = (1 - p);
    if (r < 40) {
        var prob = 0;
        var x = 0;
        for (x = 0; prob < u; x++) {
            prob += Math2.Combinations(r + x - 1, x) * Math.pow(p, x) * Math.pow(1 - p, r);
        }
        return x - 1;
    } else {
        var shift = .5;
        var u = p * r / (1 - p)
        var variance = p * r / Math.pow((1 - p), 2);
        var sigma = Math.pow(variance, 0.5)
        var sample = -1;

        while (sample < 0) {
            sample = Math.ceil(NormalDist(u, sigma) - shift);
        }
        return sample;

    }


}

//Sample on the normal distribution
function NormalDist(u, sigma) {
    return erfinv(2 * Math.random() - 1) * sigma * Math.pow(2, 0.5) + u;

}

//Sample on the poisson distribution
function PoissonDist(lambda) {

    if (lambda <= 10) {
        var u = Math.random();
        var p = 0;
        var x = -1;

        while (p < u) {
            x++;
            p += Math.pow(lambda, x) * Math.pow(Math.E, - lambda) / Math2.Factorial(x);
        }
        return x;
    } else {
        var shift = .5;

        var u = lambda;
        var sigma = Math.pow(lambda, 0.5);
        var sample = -1;

        while (sample < 0) {
            sample = Math.ceil(NormalDist(u, sigma) - shift);
        }
        return sample;
    }
}


//Sample on the discrete uniform distribution
function DiscUniformDist(a, b) {

    return Math.floor(Math.random() * (b - a + 1)) + a;

}

//Sample on the continuous uniform distribution
function ContUniformDist(a, b) {

    return Math.random() * (b - a) + a;

}

//Sample on a custom discrete distribution
function WeightedDist(probabilities,values){
	var length = probabilities.length;
	var u = Math.random();
	var x = -1;
	var p = 0;
	while(p < u){
		x++;
		p+= probabilities[x];
	}
	
	if(typeof values == "undefined"){
		return x;
	} else {
		return values[x];
	}
}


//Calculates Gamma(x+n)/Gamma(x), for integers x and n
function Pochhammer(x, n) {
    if (n <= 0) {
        return 1;
    }
    var term = 0;
    var poch = 1;

    while (term < n) {
        poch *= (x + term);
        term++;
    }
    return poch;

}

//Approximates the hypergeometric function
function HyperGeometric(a, b, c, z) {

    var ans = 0;

    for (var i = 0; i < 75; i++) {
        ans += (Pochhammer(a, i) * Pochhammer(b, i) / Pochhammer(c, i)) * Math.pow(z, i) / Math2.Factorial(i);
    }
    return ans;
}


//Approximation to error function
//Max error = 2.5*10^(-5)
function erf(x) {
    var sign = (x > 0 ? 1 : (-1));
    x = Math.abs(x);
    var t = Math.pow(1 + 0.47047 * x, - 1);
    var term1 = 0.3480242 * t;
    var term2 = -0.0958798 * t * t;
    var term3 = 0.7478556 * t * t * t;
    var term4 = Math.pow(Math.E, (-1) * x * x);

    return sign * (1 - (term1 + term2 + term3) * (term4));

}

//Approximation to inverse error function
function erfinv(x) {
    var a = 0.140012;
    var sign = (x >= 0 ? 1 : -1);
    var term1 = 2 / (Math.PI * a);
    var term2 = Math.log(1 - Math.pow(x, 2)) / 2;

    var term3 = Math.pow((term1 + term2), 2);
    var term4 = Math.log(1 - Math.pow(x, 2)) / a;

    var term5 = Math.pow(term3 - term4, 0.5);

    return sign * Math.pow(term5 - (term1 + term2), 0.5);


}


function BinomialProbability(x, n, p, cumulative) {
    if (n < 120) {
        if (cumulative) {
            var prob = 0;
            for (var i = 0; i <= x; i++) {
                prob += Math2.Combinations(n, i) * Math.pow(p, i) * Math.pow((1 - p), n - i);
            }
            return prob;
        } else {
            return Math2.Combinations(n, x) * Math.pow(p, x) * Math.pow((1 - p), n - x);
        }

    } else {
        var u = n * p;
        var sigma = Math.pow(u * (1 - p), 0.5);

        if (cumulative) {
            return NormalProbability(x + 0.5, u, sigma);
        } else {
            return NormalProbability(x + 0.5, u, sigma) - NormalProbability(x - 0.5, u, sigma);
        }
    }
}

//Of the form (1/lambda)*e^(-x/lambda)
function ExponentialProbability(x, lambda) {

    return 1 - Math.pow(Math.E, - x / lambda);

}

//Geometric Distribution on the set x = {0,1,2..}
function GeometricProbability(x, p, cumulative) {

    if (x < 50) {
        var probability = 0;
        if (cumulative) {
            for (var i = 0; i <= x; i++) {
                probability += p * Math.pow((1 - p), i);
            }
            return probability;
        } else {
            return p * Math.pow((1 - p), x);
        }

    } else {
        if (cumulative) {
            var u = (1 - p) / p;
            var sigma = Math.pow((1 - p) * Math.pow(p, - 2), 0.5);
            return NormalProbability(x + 0.5, u, sigma);
        } else {
            return Math.pow(1 - p, x) * p;
        }
    }

}

//Assumption made: rational inputs
function HyperGeometricProbability(N, n, m, x, cumulative) {
    if (N < 150) {
        if (cumulative) {
            var denom = Math2.Combinations(N, n);
            var p = 0;
            for (var i = 0; i <= x && (n - i >= 0); i++) {
                p += Math2.Combinations(m, i) * Math2.Combinations(N - m, n - i);
            }
            return p / denom;
        } else {
            return Math2.Combinations(m, x) * Math2.Combinations(N - m, n - x) / Math2.Combinations(N, n);
        }
    } else {
        var u = n * m / N;
        var sigma = Math.pow(u * (N - m) * (N - n) / (N * (N - 1)), 0.5)
        if (cumulative) {
            return NormalProbability(x + 0.5, u, sigma);

        } else {
            return NormalProbability(x + 0.5, u, sigma) - NormalProbability(x - 0.5, u, sigma);
        }
    }
}


function NegativeBinomialProbability(k, r, p, cumulative) {
   //transform p into probability of failure
    p = (1 - p);
    if ((r + k) < 150) {
        if (cumulative) {
            var prob = 0;
            for (var i = 0; i <= k; i++) {
                prob += Math2.Combinations(r + i - 1, i) * Math.pow(p, i) * Math.pow(1 - p, r);
            }
            return prob
        } else {
            return Math2.Combinations(r + k - 1, k) * Math.pow(p, k) * Math.pow(1 - p, r);
        }
    } else {

        var u = p * r / (1 - p)
        var variance = p * r / Math.pow((1 - p), 2);
        var sigma = Math.pow(variance, 0.5)
        if (cumulative) {
            return NormalProbability(k + 0.5, u, sigma);

        } else {
            return NormalProbability(k + 0.5, u, sigma) - NormalProbability(k - 0.5, u, sigma);
        }
    }

}



function NormalProbability(x, u, sigma) {
    var stdnorm = (x - u) / sigma;

    return (1 / 2) * (erf(stdnorm / Math.pow(2, 0.5)) + 1);

}

function PoissonProbability(x, lambda, cumulative) {

    if (x < 100) {
        if (cumulative) {
            var p = 0;
            for (var i = 0; i <= x; i++) {
                p += Math.pow(lambda, i) * Math.pow(Math.E, - lambda) / Math2.Factorial(i);
            }
            return p;
        } else {
            return Math.pow(lambda, x) * Math.pow(Math.E, - lambda) / Math2.Factorial(x);
        }

    } else {
        var u = lambda;
        var sigma = Math.pow(lambda, 0.5);

        if (cumulative) {
            return NormalProbability(x + 0.5, u, sigma);
        } else {
            return NormalProbability(x + 0.5, u, sigma) - NormalProbability(x - 0.5, u, sigma);
        }
    }
}

function DiscreteUniformProbability(x, a, b, cumulative) {

    if (cumulative) {
        return (x - a + 1) / (b - a + 1);
    } else {
        return 1 / (b - a + 1);
    }

}

function ContinuousUniformProbability(x, a, b) {
    return (x - a) / (b - a);
}


function RandomSequence(lb, ub) {
    var numbers = [];
    var output = [];

    for (var i = lb; i <= ub; i++) {
        numbers.push(i);
    }
    var length = numbers.length;
    var index = 0;

    for (var i = 0; i < length; i++) {
        index = Math.floor(Math.random() * numbers.length);
        output.push(numbers[index]);
        numbers.slice(index, 1);
    }
    return output;
}

function RunSample(n, dist) {
    var c = new custarray();
    for (var i = 0; i < n; i++) {
        c.push(dist());
    }
    return c;
}