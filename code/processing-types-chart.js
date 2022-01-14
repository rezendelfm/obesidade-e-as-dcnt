const processingTypesChart = {
    svg: null,
    data: [
        {
            category: 1,
            name: 'Alimentos <i>in Natura</i> ou Minimamente Processados:',
            text: 'São aqueles ao qual temos acesso da maneira como eles vêm da natureza (<i>in natura</i>) ou que recebem um processamento mínimo (lavagem, secagem, torra, etc), sem adição de ingredientes ou transformações.',
            x: 500,
            y: 2400,
            height: 900,
            width: 1200,
        },
        {
            category: 2,
            name: 'Ingredientes Culinários:',
            text: 'São substâncias extraídas dos alimentos e que são essenciais para converter alimentos <i>in natura</i> ou minimamente processados em receitas ou preparações culinárias.',
            x: 2050,
            y: 2400,
            height: 900,
            width: 700,
        },
        {
            category: 3,
            name: 'Alimentos Processados:',
            text: 'Itens do grupo de alimentos <i>in natura</i>, modificados por processos industriais simples e que, a princípio, poderiam ser realizados em casa.',
            x: 2775,
            y: 2400,
            height: 900,
            width: 700,
        },
        {
            category: 4,
            name: 'Alimentos Ultraprocessados:',
            text: 'Formulações de substâncias obtidas por meio do fracionamento de alimentos dos outros grupos e substâncias de uso exclusivamente industrial. Nesses alimentos frequentemente utilizam-se corantes, aromatizantes, emulsificantes e outros aditivos que modificam as percepções sensoriais, com o objetivo de potencializar o lucro, tornando esses produtos com baixo custo de produção, prontos para consumo, hiper palatáveis e com alto tempo de prateleira.',
            x: 4075,
            y: 2400,
            height: 900,
            width: 850,
        },
    ],
    height: 3388,
    width: 5620,
};

const addProcessingTypesImages = () => {
    processingTypesChart.svg
        .selectAll('.processing-type-image')
        .data(processingTypesChart.data)
        .enter()
        .append('svg:image')
        .attr('id', (d) => `processing-type-image-${d.category}`)
        .attr('class', 'processing-type-image')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', processingTypesChart.width)
        .attr('height', processingTypesChart.height)
        .attr(
            'xlink:href',
            (d) => `assets/interactions/food-categories-${d.category}.png`,
        )
        .style('opacity', 1);

    processingTypesChart.svg
        .append('svg:image')
        .attr('id', 'processing-type-image-base')
        .attr('class', 'processing-type-image')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', processingTypesChart.width)
        .attr('height', processingTypesChart.height)
        .attr('xlink:href', `assets/interactions/food-categories-0.png`)
        .style('opacity', 1);
};

const resetProcessingTypeImage = (e, d) => {
    d3.selectAll('.processing-type-image').style('opacity', 0);
    d3.select('#processing-type-image-base').style('opacity', 1);

    d3.select('#processing-type-disclaimer').html(
        'Clique nos ícones para saber mais sobre os grupos.',
    );
    d3.select('#processing-type-name').attr('class', null).html('');
    d3.select('#processing-type-description').html('');
};

const chooseProcessingType = (e, d) => {
    d3.selectAll('.processing-type-image').style('opacity', 0);
    d3.select(`#processing-type-image-${d.category}`).style('opacity', 1);

    d3.select('#processing-type-disclaimer').html('');
    d3.select('#processing-type-name')
        .attr('class', null)
        .attr('class', `processing-type-${d.category}`)
        .html(d.name);
    d3.select('#processing-type-description').html(d.text);
};

const addProcessingTypesHiddenAreas = () => {
    processingTypesChart.svg
        .append('rect')
        .attr('class', 'processing-type-area')
        .attr('x', 0)
        .attr('y', 0)
        .attr('height', processingTypesChart.height)
        .attr('width', processingTypesChart.width)
        .style('cursor', 'default')
        .on('click', resetProcessingTypeImage);

    processingTypesChart.svg
        .selectAll('.processing-type-areas')
        .data(processingTypesChart.data)
        .enter()
        .append('rect')
        .attr('class', 'processing-type-area')
        .attr('x', (d) => d.x)
        .attr('y', (d) => d.y)
        .attr('height', (d) => d.height)
        .attr('width', (d) => d.width)
        .on('click', chooseProcessingType);
};

const createProcessingTypesChart = () => {
    processingTypesChart.svg = d3
        .select('#processing-types-chart-container')
        .append('svg')
        .attr('id', 'processing-type-svg')
        .attr('viewBox', [
            0,
            0,
            processingTypesChart.width,
            processingTypesChart.height,
        ]);

    addProcessingTypesImages();
    addProcessingTypesHiddenAreas();
};

createProcessingTypesChart();
