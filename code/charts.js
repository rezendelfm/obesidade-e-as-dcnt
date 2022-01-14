const createCategoricalScale = (domain, range, padding) => {
    return d3.scaleBand().domain(domain).range(range).padding(padding);
};

const createContinuousColorScale = (domain, range) => {
    return d3.scaleLinear().domain(domain).range(range).nice();
};

const createNumericalScale = (domain, range) => {
    return d3.scaleLinear().domain(domain).range(range).nice();
};

const createRadiusScale = (domain, range) => {
    return d3.scaleSqrt().domain(domain).range(range).nice();
};
