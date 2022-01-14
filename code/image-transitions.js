$(window).scroll(() => {
    const windowPosition = $(this).scrollTop();
    const windowOffset = 200;

    // For Risk Factors section
    const riskFactorContainer =
        $('#risk-factors-scroll').offset().top +
        $('#risk-factors-scroll').height();
    const riskFactorPart1 = $('#risk-factors-p-1').offset().top;
    const riskFactorPart2 =
        $('#risk-factors-p-2').offset().top - windowOffset * 2.5;
    const riskFactorPart3 =
        $('#risk-factors-p-3').offset().top - windowOffset * 2;

    windowPosition > riskFactorPart1 && windowPosition < riskFactorContainer
        ? $('#risk-factors-sticky').addClass('sticky-content')
        : $('#risk-factors-sticky').removeClass('sticky-content');

    if (windowPosition > riskFactorPart2 && windowPosition < riskFactorPart3) {
        $('#risk-factors-img-1').hide();
        $('#risk-factors-img-2').show();
        $('#risk-factors-img-3').hide();
    } else if (
        windowPosition > riskFactorPart3 &&
        windowPosition < riskFactorContainer
    ) {
        $('#risk-factors-img-1').hide();
        $('#risk-factors-img-2').hide();
        $('#risk-factors-img-3').show();
    } else {
        $('#risk-factors-img-1').show();
        $('#risk-factors-img-2').hide();
        $('#risk-factors-img-3').hide();
    }

    // For Causes section
    const causesContainer =
        $('#causes-scroll').offset().top + $('#causes-scroll').height();
    const causesPart1 = $('#causes-p-1').offset().top;
    const causesPart2 = $('#causes-p-2').offset().top - 1.5 * windowOffset;
    const causesPart3 = $('#causes-p-3').offset().top - 1.5 * windowOffset;
    const causesPart4 = $('#causes-p-4').offset().top - 1.5 * windowOffset;
    const causesPart5 = $('#causes-p-5').offset().top - 1.5 * windowOffset;

    windowPosition > causesPart1 && windowPosition < causesContainer
        ? $('#causes-sticky').addClass('sticky-content')
        : $('#causes-sticky').removeClass('sticky-content');

    if (windowPosition > causesPart2 && windowPosition < causesPart3) {
        $('#causes-img-1').hide();
        $('#causes-img-2').show();
        $('#causes-img-3').hide();
        $('#causes-img-4').hide();
        $('#causes-img-5').hide();
    } else if (windowPosition > causesPart3 && windowPosition < causesPart4) {
        $('#causes-img-1').hide();
        $('#causes-img-2').hide();
        $('#causes-img-3').show();
        $('#causes-img-4').hide();
        $('#causes-img-5').hide();
    } else if (windowPosition > causesPart4 && windowPosition < causesPart5) {
        $('#causes-img-1').hide();
        $('#causes-img-2').hide();
        $('#causes-img-3').hide();
        $('#causes-img-4').show();
        $('#causes-img-5').hide();
    } else if (
        windowPosition > causesPart5 &&
        windowPosition < causesContainer
    ) {
        $('#causes-img-1').hide();
        $('#causes-img-2').hide();
        $('#causes-img-3').hide();
        $('#causes-img-4').hide();
        $('#causes-img-5').show();
    } else {
        $('#causes-img-1').show();
        $('#causes-img-2').hide();
        $('#causes-img-3').hide();
        $('#causes-img-4').hide();
        $('#causes-img-5').hide();
    }
});
