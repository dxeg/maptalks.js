describe('DrawTool', function () {
    var container, eventContainer;
    var map;

    var center = new maptalks.Coordinate(118.846825, 32.046534);

    function drawLine(drawTool) {
        var center = map.getCenter();

        var domPosition = GET_PAGE_POSITION(container);
        var point = map.coordinateToContainerPoint(center).add(domPosition);

        happen.mousedown(eventContainer, {
            'clientX':point.x,
            'clientY':point.y
        });
        happen.click(eventContainer, {
            'clientX':point.x,
            'clientY':point.y
        });
        for (var i = 0; i < 10; i++) {
            happen.mousemove(eventContainer, {
                'clientX':point.x + i,
                'clientY':point.y + i
            });
        }
        happen.mousedown(eventContainer, {
            'clientX':point.x + 10,
            'clientY':point.y
        });
        happen.click(eventContainer, {
            'clientX':point.x + 10,
            'clientY':point.y
        });

        var geojson1 = drawTool.getCurrentGeometry().toGeoJSON();

        happen.mousedown(eventContainer, {
            'clientX':point.x,
            'clientY':point.y + 10
        });
        happen.click(eventContainer, {
            'clientX':point.x,
            'clientY':point.y + 10
        });

        var geojson2 = drawTool.getCurrentGeometry().toGeoJSON();

        drawTool.undo();
        expect(drawTool.getCurrentGeometry().toGeoJSON()).to.be.eqlGeoJSON(geojson1);

        drawTool.redo();
        expect(drawTool.getCurrentGeometry().toGeoJSON()).to.be.eqlGeoJSON(geojson2);

        happen.dblclick(eventContainer, {
            'clientX':point.x - 1,
            'clientY':point.y + 5
        });
    }

    function dragDraw() {
        var center = map.getCenter();

        var domPosition = GET_PAGE_POSITION(container);
        var point = map.coordinateToContainerPoint(center).add(domPosition);
        happen.mousedown(eventContainer, {
            'clientX':point.x,
            'clientY':point.y
        });
        for (var i = 0; i < 10; i++) {
            happen.mousemove(eventContainer, {
                'clientX':point.x - i,
                'clientY':point.y - i
            });
        }
        happen.mouseup(eventContainer, {
            'clientX':point.x - 10,
            'clientY':point.y - 10
        });
    }
    function drawPoint() {
        var center = map.getCenter();

        var domPosition = GET_PAGE_POSITION(container);
        var point = map.coordinateToContainerPoint(center).add(domPosition);
        happen.mousedown(eventContainer, {
            'clientX':point.x,
            'clientY':point.y
        });
        happen.click(eventContainer, {
            'clientX':point.x,
            'clientY':point.y
        });
    }
    beforeEach(function () {
        var setups = COMMON_CREATE_MAP(center);
        container = setups.container;
        map = setups.map;
        eventContainer = map._panels.canvasContainer;

    });

    afterEach(function () {
        map.remove();
        REMOVE_CONTAINER(container);
    });
    describe('draw geometries', function () {
        it('throw exception with an undefined mode', function () {
            expect(function () {
                new maptalks.DrawTool({
                });
            }).to.throwException();
        });

        it('throw exception with an invalid mode', function () {
            expect(function () {
                new maptalks.DrawTool({
                    mode : 'invalidMode'
                });
            }).to.throwException();
        });

        it('can draw a marker', function (done) {
            function drawEnd(param) {
                expect(param.geometry instanceof maptalks.Marker).to.be.ok();
                var markerCoord = param.geometry.getCoordinates();
                expect(markerCoord.x).to.be.approx(map.getCenter().x, 1E-4);
                expect(markerCoord.y).to.be.approx(map.getCenter().y);
                done();
            }
            var drawTool = new maptalks.DrawTool({
                mode : 'Point',
                symbol : {
                    'markerPlacement':'point',
                    'markerFile'   : 'images/control/2.png',
                    'markerRotation' : 30,
                    'markerWidth'  : 20,
                    'markerHeight' : 20,
                    'markerOpacity': 1,
                    'markerDx'     : 0,
                    'markerDy'     : 0
                }
            });
            drawTool.addTo(map);
            drawTool.on('drawend', drawEnd);
            drawPoint();
        });

        it('can draw linestring', function (done) {
            function drawEnd(param) {
                expect(param.geometry instanceof maptalks.LineString).to.be.ok();
                expect(param.geometry.getLength()).to.above(0);
                done();
            }
            var drawTool = new maptalks.DrawTool({
                mode : 'LineString'
            });
            drawTool.addTo(map);
            drawTool.on('drawend', drawEnd);
            drawLine(drawTool);
        });

        it('can draw Polygon', function (done) {
            function drawEnd(param) {
                expect(param.geometry instanceof maptalks.Polygon).to.be.ok();
                expect(param.geometry.getArea()).to.above(0);
                done();
            }
            var drawTool = new maptalks.DrawTool({
                mode : 'Polygon'
            });
            drawTool.addTo(map);
            drawTool.on('drawend', drawEnd);
            drawLine(drawTool);
        });

        it('can draw circle', function (done) {
            function drawEnd(param) {
                expect(param.geometry instanceof maptalks.Circle).to.be.ok();
                expect(param.geometry.getRadius()).to.above(0);
                done();
            }
            var drawTool = new maptalks.DrawTool({
                mode : 'Circle'
            });
            drawTool.addTo(map);
            drawTool.on('drawend', drawEnd);
            dragDraw();
        });

        it('can draw Rectangle', function (done) {
            var first;
            function drawStart(param) {
                first = param.coordinate;
            }
            function drawEnd(param) {
                expect(param.geometry instanceof maptalks.Rectangle).to.be.ok();
                expect(param.geometry.getWidth()).to.above(0);
                expect(param.geometry.getHeight()).to.above(0);
                var nw = param.geometry.getCoordinates();
                expect(nw.x < first.x).to.be.ok();
                expect(nw.y > first.y).to.be.ok();
                done();
            }
            var drawTool = new maptalks.DrawTool({
                mode : 'Rectangle'
            });
            drawTool.addTo(map);
            drawTool.on('drawend', drawEnd);
            drawTool.on('drawstart', drawStart);
            dragDraw();
        });


        it('can draw Ellipse', function (done) {
            function drawEnd(param) {
                expect(param.geometry instanceof maptalks.Ellipse).to.be.ok();
                expect(param.geometry.getWidth()).to.above(0);
                expect(param.geometry.getHeight()).to.above(0);
                done();
            }
            var drawTool = new maptalks.DrawTool({
                mode : 'Ellipse'
            });
            drawTool.addTo(map);
            drawTool.on('drawend', drawEnd);
            dragDraw();
        });
    });

    describe('common methods', function () {
        it('enable/disable', function () {
            var drawTool = new maptalks.DrawTool({
                mode: 'LineString',
                symbol: {
                    strokeSymbol: {
                        stroke: '#ff0000',
                        'stroke-width': 3,
                        opacity: 0.6
                    }
                }
            });
            drawTool.addTo(map);

            expect(function () {
                drawTool.disable();
                drawTool.enable();
            }).to.not.throwException();
        });

        it('setMode', function (done) {
            function drawEnd(param) {
                expect(param.geometry instanceof maptalks.Ellipse).to.be.ok();
                expect(param.geometry.getWidth()).to.above(0);
                expect(param.geometry.getHeight()).to.above(0);
                done();
            }
            var drawTool = new maptalks.DrawTool({
                mode : 'Rectangle'
            });
            drawTool.addTo(map);
            drawTool.setMode('Ellipse');
            drawTool.on('drawend', drawEnd);
            dragDraw();
        });

        it('setMode after disable', function () {
            var drawTool = new maptalks.DrawTool({
                mode : 'Rectangle'
            });
            drawTool.addTo(map);
            drawTool.disable();
            var spy = sinon.spy(drawTool, '_switchEvents');
            drawTool.setMode('Ellipse');

            expect(spy.callCount).to.be(1);
        });

        it('setSymbol', function (done) {
            function drawEnd(param) {
                expect(param.geometry instanceof maptalks.Ellipse).to.be.ok();
                expect(param.geometry.getWidth()).to.above(0);
                expect(param.geometry.getHeight()).to.above(0);
                done();
            }
            var drawTool = new maptalks.DrawTool({
                mode: 'Ellipse'
            });
            drawTool.addTo(map);
            var symbol = {
                'lineColor': '#ff0000',
                'lineWidth': 3
            };
            drawTool.setSymbol(symbol);
            drawTool.on('drawend', drawEnd);
            dragDraw();
        });

        it('getSymbol', function () {
            var drawTool = new maptalks.DrawTool({
                mode: 'LineString'
            });
            drawTool.addTo(map);

            expect(drawTool.getSymbol()).to.not.be(null);
        });
    });


});
