const sectionIds = {
    'Epidemia de obesidade e as DCNT': '#epidemic-section',
    'As causas da obesidade em indivíduos e populações': '#causes-section',
    'O problema dos ultraprocessados': '#ultraprocessed-section',
    'Custos e Sobrecarga no SUS': '#results-section',
    'Políticas públicas para a saúde coletiva': '#policies-section',
    'Equipe e Referências': '#credits-section',
};

const scrollScreenById = (id) => {
    const windowOffset = 200;
    const scrollDiv = d3.select(id).node().offsetTop;
    window.scrollTo({ top: scrollDiv + windowOffset, behavior: 'smooth' });
};

const moveToSection = (e) => {
    const sectionName = d3.select(e.target.parentNode).select('span').text();
    scrollScreenById(sectionIds[sectionName]);
};

const closeAlert = () =>
    d3.select('#custom-mobile-alert').style('display', 'none');

const isMobile = () => {
    const mobilePatterns = [
        /Android/i,
        /webOS/i,
        /iPhone/i,
        /iPad/i,
        /iPod/i,
        /BlackBerry/i,
        /Windows Phone/i,
    ];

    return mobilePatterns.some((p) => navigator.userAgent.match(p));
};

const updateCurrentSection = () => {
    const windowPosition = window.scrollY;
    const showNavPosition = d3.select('#epidemic-section').node().offsetTop;

    windowPosition >= showNavPosition
        ? $('#navigation-menu').fadeIn()
        : $('#navigation-menu').fadeOut();

    Object.values(sectionIds).forEach((section, i) => {
        const sectionStart = d3.select(section).node().offsetTop;
        const sectionEnd =
            d3.select(section).node().offsetTop +
            d3.select(section).node().getBoundingClientRect().height;

        if (windowPosition >= sectionStart && windowPosition < sectionEnd) {
            d3.selectAll('#navigation-menu li').classed(
                'current-section',
                false,
            );

            d3.select(d3.selectAll('#navigation-menu li').nodes()[i]).classed(
                'current-section',
                true,
            );
        }
    });
};

d3.select('#close-custom-mobile-alert').on('click', closeAlert);
isMobile()
    ? d3.select('#custom-mobile-alert').style('visibility', 'visible')
    : d3.select('#custom-mobile-alert').style('display', 'none');

d3.selectAll('#results-button').on('click', () =>
    scrollScreenById('#results-section'),
);
d3.selectAll('#story-button').on('click', () =>
    scrollScreenById('#introduction-section'),
);

d3.selectAll('#navigation-menu li').on('click', moveToSection);
d3.select(window).on('scroll', updateCurrentSection);
