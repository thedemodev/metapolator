app.controller('specimenController', ['$scope', '$sce', 'sharedScope',
function($scope, $sce, sharedScope) {
    $scope.data = sharedScope.data;

    $scope.data.renderGlyphs = function(masterName, glyphName) {
        return $scope.data.stateful.glyphRendererAPI.get(masterName, glyphName);
    };

    $scope.sortableOptions = {
        helper : 'clone'
    };

    /*****************filter parameters *****************/

    // specimenPanel tells the filter to use masters or instances
    $scope.specimenPanel

    $scope.specimen = [{
        name : "Metapolator",
        text : "Metapolator"
    }, {
        name : "Pangram 1",
        text : "The quick brown fox jumps over the lazy dog."
    }, {
        name : "Pangram 2",
        text : "Bright vixens jump dozy fowl quack."
    }, {
        name : "Pangram 3",
        text : "Quick wafting zephyrs vex bold Jim."
    }, {
        name : "Something With Breaks",
        text : "Hey you,*nthe rock*nsteady " +
        "crew."
    }, {
        name : "Paragraph 1",
        text : "Grumpy wizards make toxic brew for the evil Queen and Jack. One morning when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin.*pHe lay on his armourlike back and if he lifted his head a little, he could see his brown belly slightly domed and divided by arches into stiff sections.*pThe bedding was hardly able to cover it and seemed ready to slide off any moment. His many legs pitifully thin compared with the size of the rest of him, waved about helplessly as he looked."
    }];

    // only for the masters specimen panel
    $scope.addGlyphRange = function() {
        $scope.specimen.push({
            name : "Glyph Range"
        });
    };

    $scope.selectedSpecimen = $scope.specimen[0];
    $scope.fontSize = 144;
    $scope.lineHeight = 0;
    $scope.fontbys = ["glyph", "word", "paragraph"];
    $scope.filterOptions = {
        filter : "",
        strict : 1,
        selectedFontby : $scope.fontbys[2]
    };

    var manageSpacesTimer;
    var sizeCounter = 0;

    $scope.$watch("selectedSpecimen | specimenFilter:filterOptions:data.sequences:data.families:specimenPanel:data.currentInstance", function(newVal) {
        $scope.filteredGlyphs = newVal;
        clearTimeout(manageSpacesTimer);
        manageSpacesTimer = setTimeout(function() {
            manageSpaces();
        }, 100);
    }, true);


    $scope.$watch("fontSize", function(newVal) {
        sizeCounter++;
        $scope.updateLineHeight();
        // make with auto for each resizing 
        if (sizeCounter > 2) {
            var ul = document.getElementById("specimen-ul-" + $scope.data.view.viewState);
            var children = ul.children;
            for (var i = 0, l = children.length; i < l; i++) {
                children[i].firstElementChild.style.width = "auto";
            }
        }
        clearTimeout(manageSpacesTimer);
        manageSpacesTimer = setTimeout(function() {
            manageSpaces();
        }, 100);
    }, true);

    var startPosition = parseInt($("#specimen-content").css("padding-left"));

    function manageSpaces() {
        var spaces = $(".space-character");
        var x = 0;
        var prev_x = 0;
        var prev_space = false;

        $(spaces).css({
            "width" : "auto",
            "clear" : "none"
        });
        var brokenEnd = false;
        $("#non-glyph-range li").each(function() {
            if ($(this).position().left == startPosition) {
                if ($(this).hasClass("space-character")) {
                    $(this).css({
                        "width" : "0",
                        "clear" : "both"
                    });
                }
                if (brokenEnd && !$(this).hasClass("space-character") && !$(this).hasClass("line-break") && !$(this).hasClass("paragraph-break")) {
                    $(prev_space).css({
                        "width" : "0",
                        "clear" : "both"
                    });
                }
            }
            if ($(this).hasClass("space-character")) {
                prev_space = this;
                brokenEnd = false;
            } else if ($(this).hasClass("line-break") || $(this).hasClass("paragraph-break")) {
                brokenEnd = false;
            } else {
                brokenEnd = true;
            }
        });
    }


    $scope.updateLineHeight = function() {
        $scope.lineHeight = 1 / (0.1 * $scope.fontSize + 0.58) + 0.8673;
    };

    /***************** setting the edit mode of glyphs *****************/

    $scope.selectGlyph = function(sequenceId, masterId, glyphName) {
        angular.forEach($scope.data.sequences, function(sequence) {
            angular.forEach(sequence.masters, function(master) {
                if (master.edit[0]) {
                    angular.forEach(master.glyphs, function(glyph) {
                        if (glyph.name == glyphName && sequence.id == sequenceId && master.id == masterId) {
                            glyph.edit = true;
                        } else {
                            glyph.edit = false;
                        }
                    });
                }
            });
        });
        $scope.data.updateSelectionParameters();
    };

    $scope.toggleGlyph = function(sequenceId, masterId, glyphName) {
        angular.forEach($scope.data.sequences, function(sequence) {
            angular.forEach(sequence.masters, function(master) {
                if (master.edit[0]) {
                    angular.forEach(master.glyphs, function(glyph) {
                        if (glyph.name == glyphName && sequence.id == sequenceId && master.id == masterId) {
                            glyph.edit = !glyph.edit;
                        }
                    });
                }
            });
        });
        $scope.data.updateSelectionParameters();
    };

    $scope.selectSet = function(set) {
        angular.forEach($scope.data.sequences, function(sequence) {
            angular.forEach(sequence.masters, function(master) {
                if (master.edit[0]) {
                    angular.forEach(master.glyphs, function(glyph) {
                        var isinset = false;
                        for (var m = 0; m < set.length; m++) {
                            if (glyph.name == set[m].glyph && sequence.id == set[m].sequence && master.id == set[m].master) {
                                isinset = true;
                            }
                        }
                        // could gain speed here, by removing out of set
                        if (isinset) {
                            glyph.edit = true;
                        } else {
                            glyph.edit = false;
                        }
                    });
                }
            });
        });
        $scope.data.updateSelectionParameters();
    };

    $scope.toggleSet = function(set) {
        angular.forEach($scope.data.sequences, function(sequence) {
            angular.forEach(sequence.masters, function(master) {
                if (master.edit[0]) {
                    angular.forEach(master.glyphs, function(glyph) {
                        var isinset = false;
                        for (var m = 0; m < set.length; m++) {
                            if (glyph.name == set[m].glyph && sequence.id == set[m].sequence && master.id == set[m].master) {
                                isinset = true;
                            }
                        }
                        // could gain speed here, by removing out of set
                        if (isinset) {
                            glyph.edit = !glyph.edit;
                        }
                    });
                }
            });
        });
        $scope.data.updateSelectionParameters();
    };

    $scope.deselectAll = function() {
        angular.forEach($scope.data.sequences, function(sequence) {
            angular.forEach(sequence.masters, function(master) {
                if (master.edit[$scope.data.view.viewState]) {
                    angular.forEach(master.glyphs, function(glyph) {
                        glyph.edit = false;
                    });
                }
            });
        });
        $scope.data.updateSelectionParameters();
    };

    // find out if the glyph edit is true
    $scope.askIfEditGlyph = function(glyphName, masterId, sequenceId) {
        var edit = false;
        angular.forEach($scope.data.sequences, function(sequence) {
            if (sequence.id == sequenceId) {
                angular.forEach(sequence.masters, function(master) {
                    if (master.id == masterId && master.edit[0]) {
                        angular.forEach(master.glyphs, function(glyph) {
                            if (glyph.name == glyphName) {
                                if (glyph.edit) {
                                    edit = true;
                                }
                            }
                        });
                    }
                });
            }
        });
        return edit;
    };

    /***************** - *****************/

    $scope.data.fakeSVG = {
        a : '<svg viewBox="0 0 517.75 1000"><g id="mp_glyph_12550" transform="matrix(1,0,0,-1,0,659)"><path d="M344.41,74.3053 C319.21,44.9761 284.031,30.85 253.9,30.85 C210.741,30.85 173.95,62.4228 173.95,122.6 C173.95,199.246 249.334,225.563 340.05,235.734 C340.05,241.117 340.05,246.501 340.05,251.884 C159.142,232.724 56.65,197.338 56.65,95.4 C56.65,21.513 120.45,-4.85 183.35,-4.85 C239.311,-4.85 309.892,11.4634 355.416,63.2992 C351.747,66.9679 348.079,70.6366 344.41,74.3053 z M525.5,33.125 C518.127,27.4795 510.604,24.2589 502.8,24.2589 C472.859,24.2589 467.55,42.496 467.55,99.9 C467.55,161.099 467.55,222.301 467.55,283.5 C467.55,433.114 404.655,466.575 274.75,466.575 C156.618,466.575 84.0285,418.381 84.0285,359.75 C84.0285,329 109.529,304.25 139.529,304.25 C170.279,304.25 195.029,329 195.029,359.75 C195.029,378.809 182.21,400.844 182.117,416.75 C181.983,439.585 213.693,450.425 252.65,450.425 C319.055,450.425 340.05,415.049 340.05,300.5 C340.05,225.701 340.05,150.899 340.05,76.1 C340.05,25.3477 367.378,-2.62766 435.65,-2.62766 C465.742,-2.62766 504.379,1.52742 525.5,21.375 C525.5,25.2916 525.5,29.2084 525.5,33.125 z"></g></svg>',
        b : '<svg viewBox="0 0 530.1 1000"><g id="mp_glyph_12891" transform="matrix(1,0,0,-1,0,659)"><path d="M320.95,-7.35 C401.874,-7.35 534.8,33.6724 534.8,230.075 C534.8,396.63 443.946,478.925 349.45,478.925 C297.493,478.925 240.034,454.878 217,415.75 C217,406.25 217,396.75 217,387.25 C238.026,428.127 273.616,444.075 296.75,444.075 C350.345,444.075 406.45,368.291 406.45,230.925 C406.45,78.7835 353.786,11.35 301.4,11.35 C307.917,5.11673 314.433,-1.11673 320.95,-7.35 z M105.65,0 C105.65,35.748 120.443,63 139.5,63 C181.269,63 216.545,-7.35 320.95,-7.35 C314.433,-1.11673 307.917,5.11673 301.4,11.35 C261.809,11.35 217,42.0142 217,126 C174.5,126 132,126 89.5,126 C89.5,84.0004 89.5,41.9996 89.5,0 C94.8833,0 100.267,0 105.65,0 C105.65,0 105.65,0 105.65,0 z M217,668.5 C155.688,668.5 94.3744,668.5 33.0625,668.5 C33.0625,662.833 33.0625,657.167 33.0625,651.5 C94.3744,651.5 155.688,651.5 217,651.5 C217,657.167 217,662.833 217,668.5 z M217,126 C217,303.998 217,482.002 217,660 C174.5,660 132,660 89.5,660 C89.5,482.002 89.5,303.998 89.5,126 C132,126 174.5,126 217,126 z"></g></svg>',
        c : '<svg viewBox="0 0 477.85 1000"><g id="mp_glyph_12936" transform="matrix(1,0,0,-1,0,659)"><path d="M447.591,84.25 C425.873,51.5673 376.167,21.525 330.546,21.525 C225.062,21.525 175.65,94.5224 175.65,230 C175.65,397.414 232.135,453.35 285.65,453.35 C324.737,453.35 348.048,435.63 348.048,401.375 C348.048,384.128 343.241,361.712 343.241,339.125 C343.241,306.125 368.741,282.784 403.991,282.784 C445.991,282.784 459.491,319.625 459.491,340.625 C459.491,407.831 391.409,468.65 290.75,468.65 C133.832,468.65 47.3,376.191 47.3,230 C47.3,68.561 129.806,-6.525 299.095,-6.525 C373.155,-6.525 431.427,28.3548 459.491,75.75 C455.524,78.5833 451.558,81.4167 447.591,84.25 z"></g></svg>',
        d : '<svg viewBox="0 0 558.6 1000"><g id="mp_glyph_12597" transform="matrix(1,0,0,-1,0,659)"><path d="M377.6,209.5 C377.6,47.8753 332.875,24.075 284.1,24.075 C236.512,24.075 183.3,81.0911 183.3,229.075 C183.3,387.842 242.068,441.3 300.25,441.3 C343.391,441.3 379.897,395.262 395.6,325.475 C396.733,334.825 397.867,344.175 399,353.525 C377.894,436.253 331.225,478.7 247.55,478.7 C143.486,478.7 54.1,396.291 54.1,229.925 C54.1,72.927 141.032,-9.075 240.75,-9.075 C354.754,-9.075 398,35.507 398,209.5 C391.2,209.5 384.4,209.5 377.6,209.5 z M561.537,18.5 C493.559,18.5 435.579,18.5 377.6,18.5 C377.6,12.8334 377.6,7.16661 377.6,1.5 C438.912,1.5 495.94,1.5 561.537,1.5 C561.537,7.16661 561.537,12.8334 561.537,18.5 z M505.1,10 C505.1,262.776 505.1,461.391 505.1,660 C462.6,660 420.1,660 377.6,660 C377.6,443.335 377.6,249.879 377.6,10 C420.1,10 462.6,10 505.1,10 z M505.1,668.5 C437.121,668.5 379.141,668.5 321.163,668.5 C321.163,662.833 321.163,657.167 321.163,651.5 C382.474,651.5 439.502,651.5 505.1,651.5 C505.1,657.167 505.1,662.833 505.1,668.5 z"></g></svg>',
        e : '<svg viewBox="0 0 489.25 1000"><g id="mp_glyph_12700" transform="matrix(1,0,0,-1,0,659)"><path d="M478.15,200 C478.15,403.248 378.481,468.5 267.15,468.5 C152.037,468.5 47.2,404.924 47.2,231.925 C47.2,32.1562 178.446,-7.45 301.7,-7.45 C371.361,-7.45 449.131,26.9305 478.15,75.75 C474.183,78.5833 470.217,81.4167 466.25,84.25 C436.714,40.4833 361.462,21.45 324.65,21.45 C245.498,21.45 173.85,63.8944 173.85,231.075 C173.85,327.251 197.174,451.5 266.3,451.5 C337.738,451.5 359.15,329.765 359.15,200 C398.816,200 438.484,200 478.15,200 z M418.65,217 C320.222,217 221.791,217 123.362,217 C123.362,211.333 123.362,205.667 123.362,200 C221.791,200 320.222,200 418.65,200 C418.65,205.667 418.65,211.333 418.65,217 z"></g></svg>',
        f : '<svg viewBox="0 0 410.4 1000"><g id="mp_glyph_12962" transform="matrix(1,0,0,-1,0,659)"><path d="M290.688,18.5 C210.563,18.5 130.437,18.5 50.3125,18.5 C50.3125,12.8334 50.3125,7.16661 50.3125,1.5 C130.437,1.5 210.563,1.5 290.688,1.5 C290.688,7.16661 290.688,12.8334 290.688,18.5 z M234.25,10 C234.25,159.999 234.25,310.001 234.25,460 C234.25,597.776 234.227,661.5 287.35,661.5 C319.646,661.5 340.3,640.854 340.3,592.375 C340.3,560.125 357.55,547.375 380.8,547.375 C380.8,547.375 380.8,547.375 380.8,547.375 C401.05,547.375 419.8,560.875 419.8,585.625 C419.8,630.022 380.305,678.5 287.35,678.5 C161.934,678.5 106.75,617.498 106.75,460 C106.75,284 106.75,10 106.75,10 C149.25,10 191.75,10 234.25,10 z M374,458.5 C266.105,458.5 158.207,458.5 50.3125,458.5 C50.3125,452.833 50.3125,447.167 50.3125,441.5 C158.207,441.5 266.105,441.5 374,441.5 C374,447.167 374,452.833 374,458.5 z"></g></svg>',
        g : '<svg viewBox="0 0 525.35 1000"><g id="mp_glyph_13002" transform="matrix(1,0,0,-1,0,659)"><path d="M269.85,131.5 C384.89,131.5 497.25,179.002 497.25,297.075 C497.25,411.154 400.766,467.5 285,467.5 C281.6,461.833 278.2,456.167 274.8,450.5 C326.636,450.5 369.75,407.722 369.75,297.925 C369.75,195.903 327.745,148.5 276.65,148.5 C274.383,142.833 272.117,137.167 269.85,131.5 z M285,467.5 C173.155,467.5 51.5,421.401 51.5,299 C51.5,181.621 148.017,131.5 269.85,131.5 C272.117,137.167 274.383,142.833 276.65,148.5 C228.799,148.5 187.5,196.101 187.5,299 C187.5,406.631 230.779,450.5 274.8,450.5 C278.2,456.167 281.6,...99.85,-202.5 C182.284,-202.5 110.636,-165.36 110.636,-79.0479 C110.636,-56.7462 116.893,-36.7389 130.2,-14.25 C130.2,-14.25 130.2,-14.25 130.2,-14.25 C94.1066,-17.095 40.8138,-55.5449 40.8138,-114.66 C40.8138,-187.425 150.313,-219.5 299.85,-219.5 C438.902,-219.5 532.8,-144.525 532.8,-51.95 C532.8,23.2197 471.793,51.25 375.55,51.25 C313.439,51.25 278.211,51.25 216.1,51.25 C192.407,51.25 155.95,52.7181 155.95,88.275 C155.95,133.068 196.244,152.568 203.15,159.075 C199.75,160.775 197.2,161.625 190.4,159.925 z"></g></svg>',
        h : '<svg viewBox="0 0 612.75 1000"><g id="mp_glyph_12646" transform="matrix(1,0,0,-1,0,659)"><path d="M239.75,668.5 C178.438,668.5 117.124,668.5 55.8125,668.5 C55.8125,662.833 55.8125,657.167 55.8125,651.5 C117.124,651.5 178.438,651.5 239.75,651.5 C239.75,657.167 239.75,662.833 239.75,668.5 z M239.75,10 C239.75,226.665 239.75,443.336 239.75,660 C197.25,660 154.75,660 112.25,660 C112.25,443.336 112.25,226.665 112.25,10 C154.75,10 197.25,10 239.75,10 z M286.812,18.5 C209.813,18.5 132.812,18.5 55.8125,18.5 C55.8125,12.8334 55.8125,7.16661 55.8125,1.5 C132.812,1.5 209.813,1.5 286.812,1.5 C286.812,7.16661 286.8...5,10 C572.25,99.8824 572.25,189.768 572.25,279.65 C572.25,402.865 521.248,468 407.85,468 C334.927,468 260.269,420.079 239.75,384.3 C239.75,374.1 239.75,363.9 239.75,353.7 C261.187,391.591 309.545,434 360.25,434 C414.697,434 444.75,399.694 444.75,298.35 C444.75,202.234 444.75,106.116 444.75,10 C487.25,10 529.75,10 572.25,10 z M628.688,18.5 C551.688,18.5 474.687,18.5 397.688,18.5 C397.688,12.8334 397.688,7.16661 397.688,1.5 C474.687,1.5 551.688,1.5 628.688,1.5 C628.688,7.16661 628.688,12.8334 628.688,18.5 z"></g></svg>',
        i : '<svg viewBox="0 0 304 1000"><g id="mp_glyph_12769" transform="matrix(1,0,0,-1,0,659)"><path d="M165.45,699.8 C117.675,699.8 79.65,661.775 79.65,614 C79.65,566.225 117.675,528.2 165.45,528.2 C165.45,528.2 165.45,528.2 165.45,528.2 C212.513,528.2 251.25,566.225 251.25,614 C251.25,661.775 212.513,699.8 165.45,699.8 C165.45,699.8 165.45,699.8 165.45,699.8 z M233,10 C233,156.665 233,303.335 233,450 C190.5,450 148,450 105.5,450 C105.5,303.335 105.5,156.665 105.5,10 C148,10 190.5,10 233,10 z M233,458.5 C171.688,458.5 110.374,458.5 49.0625,458.5 C49.0625,452.833 49.0625,447.167 49.0625,441.5 C110.374,441.5 171.688,441.5 233,441.5 C233,447.167 233,452.833 233,458.5 z M289.438,18.5 C209.313,18.5 129.187,18.5 49.0625,18.5 C49.0625,12.8334 49.0625,7.16661 49.0625,1.5 C129.187,1.5 209.313,1.5 289.438,1.5 C289.438,7.16661 289.438,12.8334 289.438,18.5 z"></g></svg>',
        j : '<svg viewBox="0 0 315.4 1000"><g id="mp_glyph_13083" transform="matrix(1,0,0,-1,0,659)"><path d="M63.45,-87.375 C42.45,-87.375 24.45,-101.736 24.45,-125.625 C24.45,-170.022 54.6496,-218.5 156.9,-218.5 C285.247,-218.5 337.5,-139.324 337.5,0 C337.5,175 337.5,450 337.5,450 C295,450 252.5,450 210,450 C210,300.001 210,166.07 210,7.80712e-15 C210,-128.171 216.559,-201.5 156.9,-201.5 C125.307,-201.5 103.95,-180.854 103.95,-132.375 C103.95,-100.125 86.7,-87.375 63.45,-87.375 C63.45,-87.375 63.45,-87.375 63.45,-87.375 z M337.5,458.5 C276.188,458.5 214.874,458.5 153.562,458.5 C153.562,452.833 153.562,447.167 153.562,441.5 C214.874,441.5 276.188,441.5 337.5,441.5 C337.5,447.167 337.5,452.833 337.5,458.5 z M272.8,700.8 C225.025,700.8 187,662.775 187,615 C187,567.225 225.025,529.2 272.8,529.2 C272.8,529.2 272.8,529.2 272.8,529.2 C319.864,529.2 358.6,567.225 358.6,615 C358.6,662.775 319.864,700.8 272.8,700.8 C272.8,700.8 272.8,700.8 272.8,700.8 z"></g></svg>',
        k : '<svg viewBox="0 0 587.1 1000"><g id="mp_glyph_13127" transform="matrix(1,0,0,-1,0,659)"><path d="M266.083,237.898 C290.883,197.827 315.3,158.871 340.1,118.8 C405.921,17.3057 445.24,1.5 609.35,1.5 C609.35,7.16661 609.35,12.8334 609.35,18.5 C573.343,18.5 525.564,45.506 467.874,137.613 C438.44,180.017 386.765,294.383 357.33,336.787 C436.959,423.085 315.296,291.232 266.083,237.898 z M538.737,459.425 C492.613,459.425 446.487,459.425 400.362,459.425 C400.362,453.475 400.362,447.525 400.362,441.575 C446.487,441.575 492.613,441.575 538.737,441.575 C538.737,447.525 538.737,453.475 538.737,459.425 z M188.75,142...5 132.812,18.5 55.8125,18.5 C55.8125,12.8334 55.8125,7.16661 55.8125,1.5 C132.812,1.5 209.813,1.5 286.812,1.5 C286.812,7.16661 286.812,12.8334 286.812,18.5 z M239.75,10 C239.75,226.665 239.75,443.336 239.75,660 C197.25,660 154.75,660 112.25,660 C112.25,443.336 112.25,226.665 112.25,10 C154.75,10 197.25,10 239.75,10 z M239.75,668.5 C178.438,668.5 117.124,668.5 55.8125,668.5 C55.8125,662.833 55.8125,657.167 55.8125,651.5 C117.124,651.5 178.438,651.5 239.75,651.5 C239.75,657.167 239.75,662.833 239.75,668.5 z"></g></svg>',
        l : '<svg viewBox="0 0 304 1000"><g id="mp_glyph_13186" transform="matrix(1,0,0,-1,0,659)"><path d="M239.75,668.5 C178.438,668.5 117.124,668.5 55.8125,668.5 C55.8125,662.833 55.8125,657.167 55.8125,651.5 C117.124,651.5 178.438,651.5 239.75,651.5 C239.75,657.167 239.75,662.833 239.75,668.5 z M296.188,19.425 C216.063,19.425 135.937,19.425 55.8125,19.425 C55.8125,13.4751 55.8125,7.52494 55.8125,1.575 C135.937,1.575 216.063,1.575 296.188,1.575 C296.188,7.52494 296.188,13.4751 296.188,19.425 z M239.75,11 C239.75,227.331 239.75,443.669 239.75,660 C197.25,660 154.75,660 112.25,660 C112.25,443.669 112.25,227.331 112.25,11 C154.75,11 197.25,11 239.75,11 z"></g></svg>',
        m : '<svg viewBox="0 0 912 1000"><g id="mp_glyph_13214" transform="matrix(1,0,0,-1,0,659)"><path d="M881.35,10 C881.35,99.8824 881.35,189.768 881.35,279.65 C881.35,400.242 830.348,468 716.95,468 C642.869,468 573.345,420.446 545.1,363.2 C549.067,356.4 553.033,349.6 557,342.8 C581.499,391.547 625.529,434 669.35,434 C723.797,434 753.85,399.694 753.85,298.35 C753.85,202.234 753.85,106.116 753.85,10 C796.35,10 838.85,10 881.35,10 z M565.25,9 C565.25,99.2158 565.25,189.434 565.25,279.65 C565.25,394.143 533.632,468 400.85,468 C322.712,468 256.912,420.905 239.75,384.3 C239.75,374.1 239.75,363.9 239.75,353.7 C262...5 464.562,18.5 390.688,18.5 C390.688,12.8334 390.688,7.16661 390.688,1.5 C464.562,1.5 538.438,1.5 612.312,1.5 C612.312,7.16661 612.312,12.8334 612.312,18.5 z M239.75,10 C239.75,156.665 239.75,303.335 239.75,450 C197.25,450 154.75,450 112.25,450 C112.25,303.335 112.25,156.665 112.25,10 C154.75,10 197.25,10 239.75,10 z M239.75,458.5 C178.438,458.5 117.124,458.5 55.8125,458.5 C55.8125,452.833 55.8125,447.167 55.8125,441.5 C117.124,441.5 178.438,441.5 239.75,441.5 C239.75,447.167 239.75,452.833 239.75,458.5 z"></g></svg>',
        n : '<svg viewBox="0 0 612.75 1000"><g id="mp_glyph_12837" transform="matrix(1,0,0,-1,0,659)"><path d="M239.75,458.5 C178.438,458.5 117.124,458.5 55.8125,458.5 C55.8125,452.833 55.8125,447.167 55.8125,441.5 C117.124,441.5 178.438,441.5 239.75,441.5 C239.75,447.167 239.75,452.833 239.75,458.5 z M572.25,10 C572.25,99.8824 572.25,189.768 572.25,279.65 C572.25,402.865 521.248,468 407.85,468 C334.939,468 260.367,419.605 239.75,384.3 C239.75,374.1 239.75,363.9 239.75,353.7 C261.214,391.538 309.556,434 360.25,434 C414.697,434 444.75,399.694 444.75,298.35 C444.75,202.234 444.75,106.116 444.75,10 C487.25,10 529.75,1....688,18.5 474.687,18.5 397.688,18.5 C397.688,12.8334 397.688,7.16661 397.688,1.5 C474.687,1.5 551.688,1.5 628.688,1.5 C628.688,7.16661 628.688,12.8334 628.688,18.5 z M286.812,18.5 C209.813,18.5 132.812,18.5 55.8125,18.5 C55.8125,12.8334 55.8125,7.16661 55.8125,1.5 C132.812,1.5 209.813,1.5 286.812,1.5 C286.812,7.16661 286.812,12.8334 286.812,18.5 z M239.75,10 C239.75,156.665 239.75,303.335 239.75,450 C197.25,450 154.75,450 112.25,450 C112.25,303.335 112.25,156.665 112.25,10 C154.75,10 197.25,10 239.75,10 z"></g></svg>',
        o : '<svg viewBox="0 0 535.8 1000"><g id="mp_glyph_12810" transform="matrix(1,0,0,-1,0,659)"><path d="M287.15,-8.5 C401.415,-8.5 525.45,62.9989 525.45,232 C525.45,395.074 401.281,468.5 287.15,468.5 C287.15,462.833 287.15,457.167 287.15,451.5 C357.348,451.5 395.4,387.688 395.4,232 C395.4,72.356 357.289,8.5 287.15,8.5 C287.15,2.83339 287.15,-2.83339 287.15,-8.5 z M287.15,468.5 C172.885,468.5 48.85,397.001 48.85,228 C48.85,64.926 173.019,-8.5 287.15,-8.5 C287.15,-2.83339 287.15,2.83339 287.15,8.5 C216.952,8.5 178.9,72.3124 178.9,228 C178.9,387.644 217.011,451.5 287.15,451.5 C287.15,457.167 287.15,462.833 287.15,468.5 z"></g></svg>',
        p : '<svg viewBox="0 0 549.1 1000"><g id="mp_glyph_13294" transform="matrix(1,0,0,-1,0,659)"><path d="M226.5,458.5 C165.188,458.5 103.874,458.5 42.5625,458.5 C42.5625,452.833 42.5625,447.167 42.5625,441.5 C103.874,441.5 165.188,441.5 226.5,441.5 C226.5,447.167 226.5,452.833 226.5,458.5 z M282.938,-190.575 C221.626,-190.575 160.312,-190.575 99,-190.575 C99,-196.525 99,-202.475 99,-208.425 C160.312,-208.425 221.626,-208.425 282.938,-208.425 C282.938,-202.475 282.938,-196.525 282.938,-190.575 z M226.5,-199 C226.5,17.3312 226.5,233.669 226.5,450 C184,450 141.5,450 99,450 C99,233.669 99,17.3312 99,-199 C141.5,-199 184,-199 226.5,-199 z M226.5,250.5 C226.5,405.56 273.997,435.925 321.9,435.925 C385.925,435.925 420.8,378.41 420.8,230.925 C420.8,74.276 368.403,18.7 312,18.7 C266.172,18.7 224.953,62.0983 208.5,134.525 C207.367,125.175 206.233,115.825 205.1,106.475 C226.977,21.2764 278.063,-18.7 364.7,-18.7 C466.832,-18.7 550,65.5024 550,230.075 C550,386.799 465.087,469.075 365.25,469.075 C246.835,469.075 206.1,414.916 206.1,250.5 C212.9,250.5 219.7,250.5 226.5,250.5 z"></g></svg>',
        q : '<svg viewBox="0 0 549.1 1000"><g id="mp_glyph_13384" transform="matrix(1,0,0,-1,0,659)"><path d="M556.537,458.5 C495.226,458.5 433.912,458.5 372.6,458.5 C372.6,452.833 372.6,447.167 372.6,441.5 C433.912,441.5 495.226,441.5 556.537,441.5 C556.537,447.167 556.537,452.833 556.537,458.5 z M556.537,-190.575 C476.413,-190.575 396.287,-190.575 316.163,-190.575 C316.163,-196.525 316.163,-202.475 316.163,-208.425 C396.287,-208.425 476.413,-208.425 556.537,-208.425 C556.537,-202.475 556.537,-196.525 556.537,-190.575 z M500.1,-199 C500.1,17.3312 500.1,233.669 500.1,450 C457.6,450 415.1,450 372.6,450 C372.6,233.669 372.6,17.3312 372.6,-199 C415.1,-199 457.6,-199 500.1,-199 z M393,250.5 C393,418.452 346.979,469.075 233.85,469.075 C134.013,469.075 49.1,386.799 49.1,230.075 C49.1,65.5024 132.268,-18.7 234.4,-18.7 C321.037,-18.7 372.123,21.2764 394,106.475 C392.867,115.825 391.733,125.175 390.6,134.525 C374.147,62.0983 339.166,18.7 287.1,18.7 C225.355,18.7 178.3,74.276 178.3,230.925 C178.3,378.41 213.175,435.925 277.2,435.925 C326.958,435.925 372.6,402.696 372.6,250.5 C379.4,250.5 386.2,250.5 393,250.5 z"></g></svg>',
        r : '<svg viewBox="0 0 458.85 1000"><g id="mp_glyph_13343" transform="matrix(1,0,0,-1,0,659)"><path d="M245.5,199.75 C245.5,308.637 293.934,422.25 341.1,422.25 C370.656,422.25 353.1,351.75 415.35,351.75 C441.6,351.75 467.1,376.416 467.1,408 C467.1,448.5 429.491,465.75 398.1,465.75 C334.473,465.75 231.5,432.613 231.5,199.75 C236.167,199.75 240.833,199.75 245.5,199.75 z M245.5,10 C245.5,156.665 245.5,303.335 245.5,450 C203,450 160.5,450 118,450 C118,303.335 118,156.665 118,10 C160.5,10 203,10 245.5,10 z M245.5,458.5 C184.188,458.5 122.874,458.5 61.5625,458.5 C61.5625,452.833 61.5625,447.167 61.5625,441.5 C122.874,441.5 184.188,441.5 245.5,441.5 C245.5,447.167 245.5,452.833 245.5,458.5 z M301.938,18.5 C221.813,18.5 141.687,18.5 61.5625,18.5 C61.5625,12.8334 61.5625,7.16661 61.5625,1.5 C141.687,1.5 221.813,1.5 301.938,1.5 C301.938,7.16661 301.938,12.8334 301.938,18.5 z"></g></svg>',
        s : '<svg viewBox="0 0 451.25 1000"><g id="mp_glyph_12731" transform="matrix(1,0,0,-1,0,659)"><path d="M94.2875,121.963 C62.8375,121.963 48.0375,101.613 48.0375,76.6375 C48.0375,13.9558 131.365,-10.5 244.425,-10.5 C383.199,-10.5 456.1,49.8212 456.1,136 C456.1,233.474 358.927,262.165 274.05,288.512 C203.388,310.238 141.95,332.419 141.95,380.125 C141.95,415.712 175.772,451.5 264.95,451.5 C312.045,451.5 363.5,439.686 363.5,422.462 C363.5,408.587 347.775,403.038 347.775,380.837 C347.775,355.862 367.2,341.062 394.95,341.062 C422.7,341.062 437.5,358.638 437.5,384.538 C437.5,437.456 356.747,468.5 264.95,468.5 C132.556,468.5 56.95,411.965 56.95,316.375 C56.95,215.926 157.132,191.202 244.3,165.506 C316.009,144.549 377.9,119.155 377.9,76.5 C377.9,32.8263 313.467,6.5 244.425,6.5 C187.824,6.5 121.113,14.0617 121.113,36.8625 C121.113,54.4375 139.613,53.5125 139.613,82.1875 C139.613,104.387 122.037,121.963 94.2875,121.963 z"></g></svg>',
        t : '<svg viewBox="0 0 342.95 1000"><g id="mp_glyph_13433" transform="matrix(1,0,0,-1,0,659)"><path d="M363.45,42.5 C353.773,35.9639 328.729,30.7 308,30.7 C231.509,30.7 230.3,124.505 230.3,194.275 C230.3,279.516 230.3,364.759 230.3,450 C187.8,450 145.3,450 102.8,450 C102.8,358.243 102.8,266.482 102.8,174.725 C102.8,30.7764 158.285,-6.7 263.8,-6.7 C308.723,-6.7 338.365,7.15349 363.45,25.5 C363.45,31.1666 363.45,36.8334 363.45,42.5 z M230.3,458.5 C230.3,509.999 230.3,561.5 230.3,613 C226.333,613 222.367,613 218.4,613 C205.159,520.012 155.929,482.709 102.8,458.5 C145.3,458.5 187.8,458.5 230.3,458.5 C230.3,458.5 230.3,458.5 230.3,458.5 z M353,458.5 C250.789,458.5 148.574,458.5 46.3625,458.5 C46.3625,452.833 46.3625,447.167 46.3625,441.5 C148.574,441.5 250.789,441.5 353,441.5 C353,447.167 353,452.833 353,458.5 z"></g></svg>',
        u : '<svg viewBox="0 0 584.25 1000"><g id="mp_glyph_13466" transform="matrix(1,0,0,-1,0,659)"><path d="M211.25,458.5 C149.938,458.5 88.6244,458.5 27.3125,458.5 C27.3125,452.833 27.3125,447.167 27.3125,441.5 C88.6244,441.5 149.938,441.5 211.25,441.5 C211.25,447.167 211.25,452.833 211.25,458.5 z M408,101.3 C383.908,69.2962 340.976,26 295.75,26 C241.303,26 211.25,60.3389 211.25,161.65 C211.25,257.766 211.25,353.884 211.25,450 C168.75,450 126.25,450 83.75,450 C83.75,360.118 83.75,270.232 83.75,180.35 C83.75,57.2266 134.752,-8 248.15,-8 C320.145,-8 380.468,37.9781 408,70.7 C408,80.8999 408,91.1001 408,101.3 z M535.5,458.5 C477.313,458.5 419.124,458.5 360.938,458.5 C360.938,452.833 360.938,447.167 360.938,441.5 C419.124,441.5 477.313,441.5 535.5,441.5 C535.5,447.167 535.5,452.833 535.5,458.5 z M591.938,18.5 C530.626,18.5 469.312,18.5 408,18.5 C408,12.8334 408,7.16661 408,1.5 C469.312,1.5 530.626,1.5 591.938,1.5 C591.938,7.16661 591.938,12.8334 591.938,18.5 z M535.5,10 C535.5,156.665 535.5,303.335 535.5,450 C493,450 450.5,450 408,450 C408,303.335 408,156.665 408,10 C450.5,10 493,10 535.5,10 z"></g></svg>',
        v : '<svg viewBox="0 0 509.2 1000"><g id="mp_glyph_13520" transform="matrix(1,0,0,-1,0,659)"><path d="M323.46,1.43219e-14 C323.46,1.43219e-14 349.293,118.119 349.293,118.119 C349.293,118.119 238.793,65.419 238.793,65.419 C238.793,65.419 266.942,0 266.942,0 C266.942,0 323.46,1.43219e-14 323.46,1.43219e-14 C323.46,1.43219e-14 323.46,1.43219e-14 323.46,1.43219e-14 z M531.802,458.5 C531.802,458.5 446.056,458.5 446.056,458.5 C446.056,458.5 446.056,441.5 446.056,441.5 C446.056,441.5 531.802,441.5 531.802,441.5 C531.802,441.5 531.802,458.5 531.802,458.5 z M233.627,458.5 C233.627,458.5 24.5488,458.5 24.5488,458.5 ...488,458.5 24.5488,441.5 24.5488,441.5 C24.5488,441.5 233.627,441.5 233.627,441.5 C233.627,441.5 233.627,458.5 233.627,458.5 z M323.46,1.43219e-14 C323.46,1.43219e-14 503.328,443.2 503.328,443.2 C503.328,443.2 487.178,450 487.178,450 C487.178,450 306.46,7.65 306.46,7.65 C306.46,7.65 323.46,1.43219e-14 323.46,1.43219e-14 z M349.293,118.119 C349.293,118.119 195.504,450 195.504,450 C195.504,450 51.0226,450 51.0226,450 C51.0226,450 238.793,65.419 238.793,65.419 C238.793,65.419 349.293,118.119 349.293,118.119 z"></g></svg>',
        w : '<svg viewBox="0 0 788.5 1000"><g id="mp_glyph_13563" transform="matrix(1,0,0,-1,0,659)"><path d="M619.19,-5.55112e-17 C619.19,-5.55112e-17 646.583,133.156 646.583,133.156 C646.583,133.156 528.433,78.756 528.433,78.756 C528.433,78.756 559.477,0 559.477,0 C559.477,0 619.19,-5.55112e-17 619.19,-5.55112e-17 C619.19,-5.55112e-17 619.19,-5.55112e-17 619.19,-5.55112e-17 z M315.122,-5.55112e-17 C315.122,-5.55112e-17 342.464,133.156 342.464,133.156 C342.464,133.156 224.314,78.756 224.314,78.756 C224.314,78.756 255.358,0 255.358,0 C255.358,0 315.122,-5.55112e-17 315.122,-5.55112e-17 C315.122,-5.55112e-17 315.12...458.5 C326.39,458.5 326.39,441.5 326.39,441.5 C326.39,441.5 542.594,441.5 542.594,441.5 C542.594,441.5 542.594,458.5 542.594,458.5 z M816.463,458.5 C816.463,458.5 724.981,458.5 724.981,458.5 C724.981,458.5 724.981,441.5 724.981,441.5 C724.981,441.5 816.463,441.5 816.463,441.5 C816.463,441.5 816.463,458.5 816.463,458.5 z M242.225,458.5 C242.225,458.5 29.7711,458.5 29.7711,458.5 C29.7711,458.5 29.7711,441.5 29.7711,441.5 C29.7711,441.5 242.225,441.5 242.225,441.5 C242.225,441.5 242.225,458.5 242.225,458.5 z"></g></svg>',
        x : '<svg viewBox="0 0 547.2 1000"><g id="mp_glyph_13690" transform="matrix(1,0,0,-1,0,659)"><path d="M353.024,250.27 C404.347,316.802 455.527,383.468 506.85,450 C498.917,450 490.983,450 483.05,450 C432.616,383.359 381.949,316.912 331.515,250.27 C338.685,250.27 345.854,250.27 353.024,250.27 z M89.45,10 C141.76,82.6351 194.052,155.288 246.363,227.923 C238.368,227.923 230.372,227.923 222.377,227.923 C170.139,155.279 117.888,82.6438 65.65,10 C73.5833,10 81.5167,10 89.45,10 z M575.341,18.5 C493.069,18.5 410.794,18.5 328.521,18.5 C328.521,12.8334 328.521,7.16661 328.521,1.5 C410.794,1.5 493.069,1.5 575.341,1.5 ...,18.5 14.3088,18.5 C14.3088,12.8334 14.3088,7.16661 14.3088,1.5 C59.5316,1.5 104.756,1.5 149.979,1.5 C149.979,7.16661 149.979,12.8334 149.979,18.5 z M260.079,458.5 C177.523,458.5 94.9646,458.5 12.4087,458.5 C12.4087,452.833 12.4087,447.167 12.4087,441.5 C94.9646,441.5 177.523,441.5 260.079,441.5 C260.079,447.167 260.079,452.833 260.079,458.5 z M522.75,10 C419.199,156.677 315.601,303.323 212.05,450 C163.034,450 114.016,450 65,450 C168.863,303.347 272.687,156.653 376.55,10 C425.283,10 474.017,10 522.75,10 z"></g></svg>',
        y : '<svg viewBox="0 0 533.9 1000"><g id="mp_glyph_13639" transform="matrix(1,0,0,-1,0,659)"><path d="M29.425,-147.4 C29.425,-188.658 64.3559,-211.4 120.925,-211.4 C196.551,-211.4 244.625,-178.168 281.432,-95.25 C281.432,-95.25 501.783,442.35 501.783,442.35 C501.783,442.35 484.783,450 484.783,450 C484.783,450 263.582,-86.75 263.582,-86.75 C234.683,-151.82 198.279,-174.605 157.292,-174.605 C121.042,-174.605 157.511,-86.6 87.025,-86.6 C55.025,-86.6 29.425,-110.6 29.425,-147.4 z M318.908,2.84217e-14 C318.908,2.84217e-14 350.631,129.004 350.631,129.004 C350.631,129.004 234.203,71.2126 234.203,71.2126 C234.203,...2.833 441.847,447.167 441.847,441.5 C472.042,441.5 502.237,441.5 532.432,441.5 C532.432,447.167 532.432,452.833 532.432,458.5 z M235.71,458.5 C161.297,458.5 86.8812,458.5 12.4679,458.5 C12.4679,452.833 12.4679,447.167 12.4679,441.5 C86.8812,441.5 161.297,441.5 235.71,441.5 C235.71,447.167 235.71,452.833 235.71,458.5 z M350.631,129.004 C350.631,129.004 195.774,450 195.774,450 C195.774,450 41.1164,450 41.1164,450 C41.1164,450 234.203,71.2126 234.203,71.2126 C234.203,71.2126 350.631,129.004 350.631,129.004 z"></g></svg>',
        z : '<svg viewBox="0 0 476.9 1000"><g id="mp_glyph_13754" transform="matrix(1,0,0,-1,0,659)"><path d="M448.7,18.5 C336.559,18.5 224.416,18.5 112.275,18.5 C112.275,12.8334 112.275,7.16661 112.275,1.5 C224.416,1.5 336.559,1.5 448.7,1.5 C448.7,7.16661 448.7,12.8334 448.7,18.5 z M448.7,10 C448.7,72.9994 448.7,136.001 448.7,199 C444.733,199 440.767,199 436.8,199 C436.8,136.001 436.8,72.9994 436.8,10 C440.767,10 444.733,10 448.7,10 z M244.6,18.5 C308.666,18.5 372.734,18.5 436.8,18.5 C436.8,78.6661 436.8,138.834 436.8,199 C436.8,39.0961 375.214,18.5 244.6,18.5 C244.6,18.5 244.6,18.5 244.6,18.5 z M73.05,275 C73.05...5167,275 73.05,275 z M383.5,458.5 C275.484,458.5 167.466,458.5 59.45,458.5 C59.45,452.833 59.45,447.167 59.45,441.5 C167.466,441.5 275.484,441.5 383.5,441.5 C383.5,447.167 383.5,452.833 383.5,458.5 z M184.1,1.5 C184.1,5.99996 184.1,10.5 184.1,15 C273.718,159.39 363.582,303.61 453.2,448 C453.2,451.5 453.2,455 453.2,458.5 C406.734,458.5 360.266,458.5 313.8,458.5 C313.8,455 313.8,451.5 313.8,448 C222.603,303.725 131.647,159.275 40.45,15 C40.45,10.5 40.45,5.99996 40.45,1.5 C88.3329,1.5 136.217,1.5 184.1,1.5 z"></g></svg>'
    };

}]);
