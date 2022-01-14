const mapChart = {
    svg: null,
    data: [],
    topojson: [],
    colorScale: null,
    rankingXScale: null,
    rankingYScale: null,
    indicator: 'cost',
    height: 800,
    width: 1200,
    margin: { top: 0, bottom: 0, left: 0, right: 0 },
    colors: ['#FCC349', ' #49002A'],
};

const getMapDataByState = (data) => {
    const states = [...new Set(data.map((d) => d['Estado']))];

    return states.map((s) => {
        const stateData = data.filter((d) => d['Estado'] === s);

        const cost = d3.sum(stateData, (d) => d['Custo Atr.']);
        const totalCost = d3.sum(stateData, (d) => d['Custo Total']);
        const deaths = d3.sum(stateData, (d) => d['Mortes Atr.']);
        const population = stateData[0]['População'];

        return {
            state: s,
            cost: cost / population,
            fullCost: cost,
            percent: cost / totalCost,
            deaths: deaths / (population / 1e6),
            fullDeaths: deaths,
        };
    });
};

const getMapRankingValue = (state) =>
    mapChart.data.filter((d) => d.state === state)[0][mapChart.indicator];

const formatMapChartValue = (value, indicator) => {
    if (indicator === 'percent')
        return `${(value * 100).toFixed(2).replace('.', ',')}%`;

    if (indicator === 'deaths') return value;

    if (value < 1e3) {
        return 'R$ ' + value.toFixed(2).replace('.', ',');
    } else if (value < 1e6) {
        return 'R$ ' + (value / 1e3).toFixed(2).replace('.', ',') + ' mil';
    } else if (value < 1e9) {
        return 'R$ ' + (value / 1e6).toFixed(2).replace('.', ',') + ' milhões';
    } else {
        return 'R$ ' + (value / 1e9).toFixed(2).replace('.', ',') + ' bilhões';
    }
};

const fetchMapChartData = async () => {
    const topojsonURL = 'https://api.npoint.io/722942d4cd45d25305ec';
    const dataURL = 'https://api.npoint.io/d4a7dfa1d7fef07b52f9';

    const topojson = await d3.json(topojsonURL);
    const data = await d3.json(dataURL);

    mapChart.topojson = topojson;
    mapChart.data = getMapDataByState(data).sort(
        (a, b) => a[mapChart.indicator] - b[mapChart.indicator],
    );

    createMapChart();
};

const addMapColorScale = () => {
    const domain = d3.extent(mapChart.data, (d) => d[mapChart.indicator]);
    mapChart.colorScale = createContinuousColorScale(domain, mapChart.colors);
};

const unhighlightMapAreaAndRanking = (state) => {
    d3.selectAll('.map-chart-shape-area').style('opacity', 1);
    d3.selectAll('#map-chart-ranking-axis text').style('opacity', 1);
    d3.selectAll('.map-chart-percent-bar').style('opacity', 1);
    d3.selectAll('.map-chart-ranking-bar').style('opacity', 1);
    d3.selectAll('.map-chart-ranking-label').style('opacity', 1);
};

const highlightMapAreaAndRanking = (state) => {
    const index = mapChart.rankingYScale.domain().indexOf(state);
    const mapArea = d3
        .selectAll('.map-chart-shape-area')
        .nodes()
        .filter((d) => d.__data__.properties.name === state)[0];

    d3.selectAll('.map-chart-shape-area').style('opacity', 0.25);
    d3.selectAll('#map-chart-ranking-axis text').style('opacity', 0.25);
    d3.selectAll('.map-chart-percent-bar').style('opacity', 0.25);
    d3.selectAll('.map-chart-ranking-bar').style('opacity', 0.25);
    d3.selectAll('.map-chart-ranking-label').style('opacity', 0.25);

    d3.select(mapArea).style('opacity', 1);
    d3.select(
        d3.selectAll('#map-chart-ranking-axis text').nodes()[index],
    ).style('opacity', 1);
    d3.select(d3.selectAll('.map-chart-percent-bar').nodes()[index]).style(
        'opacity',
        1,
    );
    d3.select(d3.selectAll('.map-chart-ranking-bar').nodes()[index]).style(
        'opacity',
        1,
    );
    d3.select(d3.selectAll('.map-chart-ranking-label').nodes()[index]).style(
        'opacity',
        1,
    );
};

const hideMapChartTooltip = (e, d) => {
    const state = d.properties.name;
    unhighlightMapAreaAndRanking(state);

    d3.select('#map-chart-tooltip').remove();
};

const showMapChartTooltip = (e, d) => {
    const state = d.properties.name;
    const data = mapChart.data.filter((d) => d.state === state)[0];

    hideMapChartTooltip(e, d);
    const tooltip = mapChart.svg.append('g').attr('id', 'map-chart-tooltip');
    highlightMapAreaAndRanking(state);

    const x = e.offsetX + 75;
    const y = e.offsetY;
    const width = 275;
    const height = mapChart.indicator === 'percent' ? 65 : 90;
    const xMargin = 15;
    const yMargin = 25;

    tooltip
        .append('rect')
        .attr('id', 'map-chart-tooltip-area')
        .attr('x', x)
        .attr('y', y)
        .attr('rx', 2)
        .attr('width', width)
        .attr('height', height)
        .style('stroke', mapChart.colorScale(data[mapChart.indicator]));

    tooltip
        .append('text')
        .attr('class', 'map-chart-tooltip-label')
        .attr('x', x + xMargin)
        .attr('y', y + yMargin)
        .text('Estado:');

    tooltip
        .append('text')
        .attr('class', 'map-chart-tooltip-value')
        .attr('x', x + width - xMargin)
        .attr('y', y + yMargin)
        .attr('text-anchor', 'end')
        .text(data.state);

    const label1 = tooltip
        .append('text')
        .attr('class', 'map-chart-tooltip-label')
        .attr('x', x + xMargin)
        .attr('y', y + yMargin * 2);

    const label2 = tooltip
        .append('text')
        .attr('class', 'map-chart-tooltip-label')
        .attr('x', x + xMargin)
        .attr('y', y + yMargin * 3);

    const value1 = tooltip
        .append('text')
        .attr('class', 'map-chart-tooltip-value')
        .attr('x', x + width - xMargin)
        .attr('y', y + yMargin * 2)
        .attr('text-anchor', 'end');

    const value2 = tooltip
        .append('text')
        .attr('class', 'map-chart-tooltip-value')
        .attr('x', x + width - xMargin)
        .attr('y', y + yMargin * 3)
        .attr('text-anchor', 'end');

    if (mapChart.indicator === 'cost') {
        label1.text('Custo total:');
        value1.text(formatMapChartValue(data.fullCost, 'cost'));
        label2.text('Custo ajustado:');
        value2.text(formatMapChartValue(data.cost, 'cost'));
    } else if (mapChart.indicator === 'percent') {
        label1.text('Porcentagem atribuível:');
        value1.text(formatMapChartValue(data.percent, 'percent'));
    } else {
        label1.text('Mortes:');
        value1.text(formatMapChartValue(data.fullDeaths, 'deaths'));
        label2.text('Mortes (por milhão de hab.):');
        value2.text(data.deaths.toFixed(1).replace('.', ','));
    }
};

const addMapChartShape = () => {
    const mesh = topojson.mesh(
        mapChart.topojson,
        mapChart.topojson.objects.states,
    );

    const features = topojson.feature(
        mapChart.topojson,
        mapChart.topojson.objects.states,
    ).features;

    const projection = d3.geoMercator().fitExtent(
        [
            [mapChart.margin.left, mapChart.margin.top],
            [mapChart.width / 2, mapChart.height - mapChart.margin.bottom],
        ],
        mesh,
    );
    const geoPath = d3.geoPath().projection(projection);

    addMapColorScale();
    mapChart.svg
        .append('g')
        .attr('id', 'map-chart-shape')
        .selectAll('.map-chart-shape-area')
        .data(features)
        .enter()
        .append('path')
        .attr('class', 'map-chart-shape-area')
        .attr('d', geoPath)
        .attr('fill', (d) =>
            mapChart.colorScale(getMapRankingValue(d.properties.name)),
        )
        .on('mouseenter', showMapChartTooltip)
        .on('mousemove', showMapChartTooltip)
        .on('mouseleave', hideMapChartTooltip);
};

const getMapChartLegendText = (value) => {
    if (mapChart.indicator === 'cost')
        return 'R$ ' + value.toFixed(2).replace('.', ',');

    if (mapChart.indicator === 'percent')
        return `${(value * 100).toFixed(1).replace('.', ',')}%`;

    if (mapChart.indicator === 'deaths')
        return value.toFixed(1).replace('.', ',');
};

const addMapChartGradient = () => {
    const gradient = mapChart.svg
        .append('defs')
        .attr('class', 'custom-gradient')
        .append('linearGradient')
        .attr('id', 'map-chart-gradient')
        .attr('x1', '0%')
        .attr('x2', '0%')
        .attr('y1', '0%')
        .attr('y2', '100%');

    gradient
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', mapChart.colors[1]);
    gradient
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', mapChart.colors[0]);
};

const addMapChartLegend = () => {
    const legend = mapChart.svg.append('g').attr('id', 'map-chart-legend');
    const legendProperties = {
        x: mapChart.margin.left,
        y: mapChart.height / 1.8,
        height: mapChart.height * 0.275,
        width: 25,
    };

    addMapChartGradient();
    legend
        .append('rect')
        .attr('class', 'map-chart-legend-bar')
        .attr('x', legendProperties.x)
        .attr('y', legendProperties.y)
        .attr('height', legendProperties.height)
        .attr('width', legendProperties.width)
        .attr('rx', 2)
        .attr('ry', 2)
        .style('fill', 'url(#map-chart-gradient)');

    legend
        .append('text')
        .attr('class', 'map-chart-legend-text')
        .attr('x', legendProperties.x + legendProperties.width * 1.3)
        .attr('y', legendProperties.y + legendProperties.height - 8)
        .attr('alignment-baseline', 'middle')
        .text(getMapChartLegendText(mapChart.colorScale.domain()[0]));

    legend
        .append('text')
        .attr('class', 'map-chart-legend-text')
        .attr('x', legendProperties.x + legendProperties.width * 1.3)
        .attr('y', legendProperties.y + 8)
        .attr('alignment-baseline', 'middle')
        .text(getMapChartLegendText(mapChart.colorScale.domain()[1]));

    if (mapChart.indicator === 'cost') {
        legend
            .append('text')
            .attr('class', 'map-chart-legend-details')
            .attr('x', legendProperties.x)
            .attr('y', legendProperties.y + legendProperties.height + 20)
            .text('Custo ajustado pelo número');

        legend
            .append('text')
            .attr('class', 'map-chart-legend-details')
            .attr('x', legendProperties.x)
            .attr('y', legendProperties.y + legendProperties.height + 38)
            .text('de habitantes');
    }

    if (mapChart.indicator === 'percent')
        legend
            .append('text')
            .attr('class', 'map-chart-legend-details')
            .attr('x', legendProperties.x)
            .attr('y', legendProperties.y + legendProperties.height + 20)
            .text('Porcentagem atribuível');

    if (mapChart.indicator === 'deaths')
        legend
            .append('text')
            .attr('class', 'map-chart-legend-details')
            .attr('x', legendProperties.x)
            .attr('y', legendProperties.y + legendProperties.height + 20)
            .text('Mortes por milhão de habitantes');
};

const addMapRankingXScale = () => {
    const domain =
        mapChart.indicator === 'percent'
            ? [0, 1]
            : [0, d3.max(mapChart.data, (d) => d[mapChart.indicator]) * 1.25];

    const range = [
        mapChart.width / 1.5,
        mapChart.width - mapChart.margin.right,
    ];

    mapChart.rankingXScale = createNumericalScale(domain, range);
};

const addMapRankingYScale = () => {
    const domain = d3.map(mapChart.data, (d) => d.state);
    const range = [mapChart.height - 75, 75];

    mapChart.rankingYScale = createCategoricalScale(domain, range, 0);
};

const addMapChartRanking = () => {
    const ranking = mapChart.svg.append('g').attr('id', 'map-chart-ranking');
    const rankingX = mapChart.width / 1.5;

    addMapRankingXScale();
    addMapRankingYScale();
    const rankingAxis = d3.axisLeft(mapChart.rankingYScale).tickPadding(5);

    const bandwidth = mapChart.rankingYScale.bandwidth();
    ranking
        .append('g')
        .attr('id', 'map-chart-ranking-axis')
        .attr('transform', `translate(${rankingX}, 0)`)
        .call(rankingAxis);

    if (mapChart.indicator === 'percent')
        ranking
            .selectAll('.map-chart-percent-bar')
            .data(mapChart.data)
            .enter()
            .append('rect')
            .attr('class', 'map-chart-percent-bar')
            .attr('x', rankingX)
            .attr('y', (d) => mapChart.rankingYScale(d.state) + 5)
            .attr('height', bandwidth - 5)
            .attr('width', mapChart.width - rankingX - mapChart.margin.right)
            .attr('rx', 5)
            .attr('ry', 5)
            .on('mouseenter', (e, d) => highlightMapAreaAndRanking(d.state))
            .on('mouseleave', (e, d) => unhighlightMapAreaAndRanking(d.state));

    ranking
        .selectAll('.map-chart-ranking-bar')
        .data(mapChart.data)
        .enter()
        .append('rect')
        .attr('class', 'map-chart-ranking-bar')
        .attr('x', rankingX)
        .attr('y', (d) => mapChart.rankingYScale(d.state) + 5)
        .attr('height', bandwidth - 5)
        .attr(
            'width',
            (d) => mapChart.rankingXScale(d[mapChart.indicator]) - rankingX,
        )
        .attr('rx', 5)
        .attr('ry', 5)
        .attr('fill', (d) => mapChart.colorScale(d[mapChart.indicator]))
        .on('mouseenter', (e, d) => highlightMapAreaAndRanking(d.state))
        .on('mouseleave', (e, d) => unhighlightMapAreaAndRanking(d.state));

    ranking
        .selectAll('.map-chart-ranking-label')
        .data(mapChart.data)
        .enter()
        .append('text')
        .attr('class', 'map-chart-ranking-label')
        .attr('x', (d) => mapChart.rankingXScale(d[mapChart.indicator]) + 5)
        .attr('y', (d) => mapChart.rankingYScale(d.state) + bandwidth / 1.25)
        .text((d) => {
            if (mapChart.indicator === 'cost')
                return d[mapChart.indicator].toFixed(2).replace('.', ',');

            if (mapChart.indicator === 'percent')
                return (
                    (d[mapChart.indicator] * 100).toFixed(2).replace('.', ',') +
                    '%'
                );

            if (mapChart.indicator === 'deaths')
                return d[mapChart.indicator].toFixed(1).replace('.', ',');
        })
        .on('mouseenter', (e, d) => highlightMapAreaAndRanking(d.state))
        .on('mouseleave', (e, d) => unhighlightMapAreaAndRanking(d.state));

    ranking
        .selectAll('.map-chart-hidden-bar')
        .data(mapChart.data)
        .enter()
        .append('rect')
        .attr('class', 'map-chart-hidden-bar')
        .attr('x', 35 + mapChart.width / 2)
        .attr('y', (d) => mapChart.rankingYScale(d.state))
        .attr('height', bandwidth)
        .attr('width', mapChart.width / 2)
        .on('mouseenter', (e, d) => highlightMapAreaAndRanking(d.state))
        .on('mouseleave', (e, d) => unhighlightMapAreaAndRanking(d.state));
};

const changeMapChartIndicator = () => {
    mapChart.indicator = d3.select('#map-chart-indicator').property('value');

    mapChart.data = mapChart.data.sort(
        (a, b) => a[mapChart.indicator] - b[mapChart.indicator],
    );

    updateMapChart();
};

const createMapChart = () => {
    mapChart.svg = d3
        .select('#map-chart-container')
        .append('svg')
        .attr('id', 'map-chart-svg')
        .attr('viewBox', [0, 0, mapChart.width, mapChart.height]);

    updateMapChart();
};

const updateMapChart = () => {
    mapChart.svg.select('#map-chart-shape').remove();
    addMapChartShape();

    mapChart.svg.select('#map-chart-gradient').remove();
    mapChart.svg.select('#map-chart-legend').remove();
    addMapChartLegend();

    mapChart.svg.select('#map-chart-ranking').remove();
    addMapChartRanking();
};

d3.select('#map-chart-indicator').on('change', changeMapChartIndicator);

fetchMapChartData();
