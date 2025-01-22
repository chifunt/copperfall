export const EasingFunctions = {
  linear: (t) => t,

  // Quadratic
  easeInQuad: (t) => t * t,
  easeOutQuad: (t) => t * (2 - t),
  easeInOutQuad: (t) =>
    t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,

  // Cubic
  easeInCubic: (t) => t * t * t,
  easeOutCubic: (t) => (--t) * t * t + 1,
  easeInOutCubic: (t) =>
    t < 0.5
      ? 4 * t * t * t
      : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,

  // Exponential
  easeInExpo: (t) =>
    t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),
  easeOutExpo: (t) =>
    t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
  easeInOutExpo: (t) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    return t < 0.5
      ? Math.pow(2, 10 * (2 * t - 1)) / 2
      : (2 - Math.pow(2, -10 * (2 * t - 1))) / 2;
  },

  // Elastic
  easeInElastic: (t) => {
    if (t === 0 || t === 1) return t;
    const c4 = (2 * Math.PI) / 0.3; // Adjusts the period
    return -Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.075) * c4);
  },
  easeOutElastic: (t) => {
    if (t === 0 || t === 1) return t;
    const c4 = (2 * Math.PI) / 0.3;
    return Math.pow(2, -10 * t) * Math.sin((t - 0.075) * c4) + 1;
  },
  easeInOutElastic: (t) => {
    if (t === 0 || t === 1) return t;
    const c5 = (2 * Math.PI) / 0.45; // Adjusts the period
    if (t < 0.5) {
      return (
        -0.5 *
        Math.pow(2, 20 * t - 10) *
        Math.sin((20 * t - 11.125) * c5)
      );
    } else {
      return (
        Math.pow(2, -20 * t + 10) *
          Math.sin((20 * t - 11.125) * c5) *
          0.5 +
        1
      );
    }
  },

  // Bounce
  easeOutBounce: (t) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  },
  easeInBounce: function (t) {
    return 1 - this.easeOutBounce(1 - t);
  },
  easeInOutBounce: function (t) {
    return t < 0.5
      ? (1 - this.easeOutBounce(1 - 2 * t)) * 0.5
      : this.easeOutBounce(2 * t - 1) * 0.5 + 0.5;
  },

  // Back Easing Functions
  easeInBack: (t) => {
    const s = 1.70158; // Overshoot amount
    return t * t * ((s + 1) * t - s);
  },
  easeOutBack: (t) => {
    const s = 1.70158;
    const invT = t - 1;
    return invT * invT * ((s + 1) * invT + s) + 1;
  },
  easeInOutBack: (t) => {
    const s = 1.70158 * 1.525;
    if (t < 0.5) {
      return (t * 2) * (t * 2) * ((s + 1) * (t * 2) - s) / 2;
    } else {
      const invT = t * 2 - 2;
      return (invT * invT * ((s + 1) * invT + s) + 2) / 2;
    }
  },
};
