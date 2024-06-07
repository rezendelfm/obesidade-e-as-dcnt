const mainChart = {
    svg: null,
    data: [],
    groupedData: [],
    yScale: null,
    sizeScales: {},
    orderBy: 'Custo Atribuível',
    showLabels: true,
    height: 800,
    width: 1200,
    margin: { top: 100, bottom: 25, left: 300, right: 10 },
};

const attributeNames = {
    'Custo Atribuível': 'cost',
    'Porcentagem Atribuível': 'percent',
    'Procedimentos Totais': 'procedures',
    'Mortes': 'deaths',
};

const getMainDataByGroup = (data) => {
    const groups = [...new Set(data.map((d) => d['Grupo']))];

    const location = d3.select('#main-chart-location').property('value');

    return groups.map((g) => {
        const groupData = data
            .filter((d) => d['Local'] === location)
            .filter((d) => d['Grupo'] === g);

        return {
            group: g,
            cost: d3.sum(groupData, (d) => d['Custo Atr.']),
            percent:
                d3.sum(groupData, (d) => d['Custo Atr.']) /
                d3.sum(groupData, (d) => d['Custo Total']),
            procedures: d3.sum(groupData, (d) => d['Procedimentos Atr.']),
            deaths: d3.sum(groupData, (d) => d['Mortes Atr.']),
        };
    });
};

const reorderMainChartData = (e, d) => {
    mainChart.orderBy = d;
    updateMainChart();
};

const formatMainChartValue = (value, indicator) => {
    if (indicator === 'percent')
        return `${(value * 100).toFixed(1).replace('.', ',')}%`;

    let label = '';
    if (value < 1e3) {
        label = value.toFixed(0) + '';
    } else if (value < 1e6) {
        label = (value / 1e3).toFixed(2) + ' mil';
    } else if (value < 1e9) {
        label = (value / 1e6).toFixed(2) + ' milhões';
        if ((value / 1e6).toFixed(2) <= '1.99') label = (value / 1e6).toFixed(2) + ' milhão';
    } else {
        label = (value / 1e9).toFixed(2) + ' bilhões';
        if ((value / 1e9).toFixed(2) <= '1.99   ') label = (value / 1e9).toFixed(2) + ' bilhão';
    }

    return indicator === 'cost'
        ? `R$ ${label.replace('.', ',')}`
        : label.replace('.', ',');
};

const fetchMainChartData = async () => {
    const dataURL = 'https://api.npoint.io/0ae867ec1144004e20e1';

    const response = await d3.json(dataURL);
    mainChart.data = response;
    mainChart.groupedData = getMainDataByGroup(response).sort(
        (a, b) =>
            a[attributeNames[mainChart.orderBy]] -
            b[attributeNames[mainChart.orderBy]],
    );

    createMainChart();
};

const addMainChartXAxis = () => {
    const translate = mainChart.margin.top;
    const domain = Object.keys(attributeNames);
    const range = [
        mainChart.margin.left,
        mainChart.width - mainChart.margin.right,
    ];

    const tickPadding = 50;
    mainChart.xScale = createCategoricalScale(domain, range, 0.25);
    const xAxis = d3
        .axisTop(mainChart.xScale)
        .tickPadding(tickPadding)
        .tickSizeOuter(0);

    mainChart.svg
        .append('g')
        .attr('id', 'main-chart-x-axis')
        .attr('transform', `translate(0, ${translate})`)
        .call(xAxis);

    mainChart.svg
        .append('text')
        .attr('id', 'main-chart-x-axis-details')
        .attr('x', mainChart.margin.left - 25)
        .attr('y', 45)
        .attr('text-anchor', 'end')
        .text('Dados ordenados por:');
};

const addMainChartYAxis = () => {
    const translate = mainChart.margin.left;
    const domain = d3.map(
        mainChart.groupedData.sort(
            (a, b) =>
                a[attributeNames[mainChart.orderBy]] -
                b[attributeNames[mainChart.orderBy]],
        ),
        (d) => d.group,
    );
    const range = [
        mainChart.height - mainChart.margin.bottom,
        mainChart.margin.top,
    ];

    const tickPadding = 25;
    mainChart.yScale = createCategoricalScale(domain, range, 0.25);
    const yAxis = d3
        .axisLeft(mainChart.yScale)
        .tickPadding(tickPadding)
        .tickSize(
            -mainChart.width +
                mainChart.margin.left +
                mainChart.margin.right +
                tickPadding,
        );

    mainChart.svg
        .append('g')
        .attr('id', 'main-chart-y-axis')
        .attr('transform', `translate(${translate}, 0)`)
        .call(yAxis);
};

const addMainChartSizeScales = () => {
    Object.values(attributeNames).map((attr) => {
        const values = mainChart.groupedData.map((d) => d[attr]);
        const domain = [d3.min(values), d3.max(values)];
        mainChart.sizeScales[attr] = createRadiusScale(domain, [35, 78]);
    });
};

const addMainChartCircles = () => {
    const circles = mainChart.svg.append('g').attr('id', 'main-chart-circles');

    const groups = [...new Set(mainChart.groupedData.map((d) => d.group))].sort(
        (a, b) => a.localeCompare(b),
    );

    Object.entries(attributeNames).map((attr) => {
        const g = circles
            .selectAll(`.main-chart-circle-${attr[1]}`)
            .data(mainChart.groupedData)
            .enter()
            .append('circle')
            .attr(
                'class',
                (d) =>
                    `main-chart-circle main-chart-circle-category-${
                        groups.indexOf(d.group) + 1
                    }`,
            )
            .attr(
                'cx',
                mainChart.xScale(attr[0]) + mainChart.xScale.bandwidth() / 2,
            )
            .attr(
                'cy',
                (d) =>
                    mainChart.yScale(d.group) +
                    mainChart.yScale.bandwidth() / 2,
            );

        g.transition()
            .duration(500)
            .attr('r', (d) =>
                d[attr[1]] === 0
                    ? 0
                    : mainChart.sizeScales[attr[1]](d[attr[1]]),
            );

        if (mainChart.showLabels) addMainChartLabels();
    });
};

const addMainChartLabels = () => {
    d3.select('#main-chart-labels').remove();
    const labels = mainChart.svg.append('g').attr('id', 'main-chart-labels');

    const groups = [...new Set(mainChart.groupedData.map((d) => d.group))].sort(
        (a, b) => a.localeCompare(b),
    );

    Object.entries(attributeNames).map((attr) => {
        const g = labels
            .selectAll(`.main-chart-label-${attr[1]}`)
            .data(mainChart.groupedData)
            .enter()
            .append('text')
            .attr('class', 'main-chart-label')
            .attr(
                'x',
                mainChart.xScale(attr[0]) + mainChart.xScale.bandwidth() / 2,
            )
            .attr(
                'y',
                (d) =>
                    mainChart.yScale(d.group) +
                    mainChart.yScale.bandwidth() / 2,
            )

            .attr('alignment-baseline', 'middle')
            .attr('text-anchor', 'middle');

        g.transition()
            .delay(mainChart.showLabels ? 300 : 0)
            .text((d) => formatMainChartValue(d[attr[1]], attr[1]));
    });
};

const changeMainChartTickStatus = () => {
    if (mainChart.showLabels) {
        d3.select('#main-chart-labels').remove();
        d3.select('#main-chart-tick-fill').attr('opacity', 0);

        mainChart.showLabels = false;
    } else {
        addMainChartLabels();
        d3.select('#main-chart-tick-fill').attr('opacity', 1);
        mainChart.showLabels = true;
    }
};

const addMainChartTick = () => {
    const squareSize = 15;
    mainChart.svg
        .append('rect')
        .attr('id', 'main-chart-tick')
        .attr('x', mainChart.margin.left - 25 - squareSize)
        .attr('y', 70)
        .attr('height', squareSize)
        .attr('width', squareSize)
        .on('click', changeMainChartTickStatus);

    mainChart.svg
        .append('rect')
        .attr('id', 'main-chart-tick-fill')
        .attr('x', mainChart.margin.left - 25 - squareSize + 3)
        .attr('y', 70 + 3)
        .attr('height', squareSize - 6)
        .attr('width', squareSize - 6)
        .attr('opacity', 1)
        .on('click', changeMainChartTickStatus);

    mainChart.svg
        .append('text')
        .attr('id', 'main-chart-tick-message')
        .attr('x', mainChart.margin.left - 25 - squareSize * 1.5)
        .attr('y', 71 + squareSize / 2)
        .attr('alignment-baseline', 'middle')
        .attr('text-anchor', 'end')
        .text('Mostrar valores')
        .on('click', changeMainChartTickStatus);
};

const createMainChartTable = () => {
    const headersText = ['', 'Custo (R$)', '%', 'Procedimentos', 'Mortes'];
    const table = d3.select('#main-chart-table');

    const headers = table.append('tr');
    headersText.map((d) => headers.append('th').text(d));
};

const updateMainChartTable = (e, d) => {
    const group = d3.select(e.target).text();
    d3.select('#main-chart-disclaimer').style('display', 'none');
    d3.selectAll('#main-chart-y-axis .tick text').classed(
        'main-chart-current-group',
        false,
    );
    d3.select(e.target).classed('main-chart-current-group', true);

    const index = mainChart.groupedData.map((d) => d.group).indexOf(group) + 1;
    const location = d3.select('#main-chart-location').property('value');
    d3.select('#main-chart-table').style('visibility', 'visible');

    d3.selectAll('#main-chart-table tr td').text('');
    d3.selectAll(
        d3.selectAll('#main-chart-table tr').nodes().slice(1),
    ).remove();

    const groupData = mainChart.groupedData.filter((d) => d.group === group);

    const detailedData = mainChart.data
        .filter((d) => d['Local'] === location)
        .filter((d) => d['Grupo'] === group);

    [...Array(groupData.length + detailedData.length).keys()].map((r) => {
        const row = d3.select('#main-chart-table').append('tr');
        [...Array(5).keys()].map((d) => row.append('td'));
    });

    const groupRow = d3.selectAll('#main-chart-table tr').nodes()[1];
    const dataRows = d3.selectAll('#main-chart-table tr').nodes().slice(2);

    d3.select(groupRow)
        .attr('class', null)
        .classed(`main-table-row-category-${index}`, true);

    groupValues = {
        name: group,
        cost: formatMainChartValue(
            groupData.map((d) => d.cost)[0],
            'cost-no-mark',
        ),
        percent: formatMainChartValue(
            groupData.map((d) => d.percent)[0],
            'percent',
        ),
        procedures: formatMainChartValue(
            groupData.map((d) => d.procedures)[0],
            'procedures',
        ),
        deaths: formatMainChartValue(
            groupData.map((d) => d.deaths)[0],
            'deaths',
        ),
    };
    d3.select(groupRow)
        .selectAll('td')
        .nodes()
        .forEach((cell, i) =>
            d3.select(cell).text(Object.values(groupValues)[i]),
        );

    detailedData.forEach((d, i) => {
        const values = {
            name: d['Desfecho'],
            cost: formatMainChartValue(d['Custo Atr.'], 'cost-no-mark'),
            percent: formatMainChartValue(
                d['Custo Atr.'] / d['Custo Total'],
                'percent',
            ),
            procedures: formatMainChartValue(
                d['Procedimentos Atr.'],
                'procedures',
            ),
            deaths: formatMainChartValue(d['Mortes Atr.'], 'deaths'),
        };

        d3.select(dataRows[i])
            .selectAll('td')
            .nodes()
            .forEach((cell, j) =>
                d3.select(cell).text(Object.values(values)[j]),
            );
    });

    d3.selectAll('#main-chart-table tr td')
        .nodes()
        .forEach((cell) => {
            if (d3.select(cell).text() === '.')
                d3.select(cell).attr('visibility', 'hidden');
        });
};

const updateMainChartDetails = () => {
    const location = d3.select('#main-chart-location').property('value');
    const data = mainChart.data.filter((d) => d['Local'] === location);

    const totalCost = d3.sum(data, (d) => d['Custo Total']);
    const cost = d3.sum(data, (d) => d['Custo Atr.']);
    const percent = cost / totalCost;
    const deaths = d3.sum(data, (d) => d['Mortes Atr.']);
    const hospitalizations = d3.sum(data, (d) => d['Hospitalizações Atr.']);
    const ambulatory = d3.sum(data, (d) => d['Ambulatoriais Atr.']);

    d3.select('#main-chart-cost').text(formatMainChartValue(totalCost, 'cost'));
    d3.select('#main-chart-atr-cost').text(formatMainChartValue(cost, 'cost'));
    d3.select('#main-chart-percent').text(
        formatMainChartValue(percent, 'percent'),
    );
    d3.select('#main-chart-deaths').text(
        formatMainChartValue(deaths, 'deaths'),
    );
    d3.select('#main-chart-hospitalizations').text(
        formatMainChartValue(hospitalizations, 'procedures'),
    );
    d3.select('#main-chart-ambulatory').text(
        formatMainChartValue(ambulatory, 'procedures'),
    );
};

const createMainChart = () => {
    mainChart.svg = d3
        .select('#main-chart-container')
        .append('svg')
        .attr('id', 'main-chart-svg')
        .attr('viewBox', [0, 0, mainChart.width, mainChart.height]);

    createMainChartTable();

    addMainChartTick();

    updateMainChart();
};

const updateMainChart = () => {
    mainChart.svg.select('#main-chart-x-axis').remove();
    mainChart.svg.select('#main-chart-x-axis-details').remove();
    addMainChartXAxis();
    mainChart.svg
        .selectAll('#main-chart-x-axis .tick text')
        .on('click', reorderMainChartData);

    mainChart.svg.select('#main-chart-y-axis').remove();
    addMainChartYAxis();

    mainChart.sizeScales = {};
    addMainChartSizeScales();

    mainChart.svg.selectAll('#main-chart-circles').remove();
    mainChart.svg.selectAll('#main-chart-labels').remove();
    addMainChartCircles();

    const tickLabels = mainChart.svg.selectAll('#main-chart-x-axis .tick text');
    tickLabels.nodes().forEach((label) => {
        const labelText = d3.select(label).text();
        labelText === mainChart.orderBy
            ? d3.select(label).classed('main-chart-current-order', true)
            : d3.select(label).classed('main-chart-current-order', false);
    });

    mainChart.svg
        .selectAll('#main-chart-y-axis .tick text')
        .on('click', updateMainChartTable);

    updateMainChartDetails();
};

const changeMainChartLocation = () => {
    mainChart.groupedData = getMainDataByGroup(mainChart.data).sort(
        (a, b) =>
            a[attributeNames[mainChart.orderBy]] -
            b[attributeNames[mainChart.orderBy]],
    );

    d3.select('#main-chart-table').style('visibility', 'hidden');

    updateMainChart();
};

d3.select('#main-chart-location').on('change', changeMainChartLocation);

fetchMainChartData();
