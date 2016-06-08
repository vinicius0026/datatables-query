/* global describe, it */

'use strict';

var async = require('async'),
    sinon = require('sinon'),
    datatablesQuery = require('./index'),
    expect = require('chai').expect;

describe('datatablesQuery tests', function () {

    describe('isNaNorUndefined tests', function () {
        it('should return true when isNaN or is undefined', function (done) {
            var query = datatablesQuery({}),
                a = {}.a; // accessing property that does not exists should return undefined;

            expect(query.isNaNorUndefined(NaN)).to.equal(true);
            expect(query.isNaNorUndefined(undefined)).to.equal(true);
            expect(query.isNaNorUndefined(Number(undefined))).to.equal(true);
            expect(query.isNaNorUndefined(a)).to.equal(true);
            done();
        });

        it('should should return false when param is a number', function (done) {
            var query = datatablesQuery({});

            expect(query.isNaNorUndefined(1)).to.equal(false);
            done();
        });

        it('should return false when param is number zero', function (done) {
            var query = datatablesQuery({});

            expect(query.isNaNorUndefined(0)).to.equal(false);
            done();
        });
    });

    describe('buildFindParameters tests', function () {
        var query = datatablesQuery({});

        it('should return an empty object if no search term was defined', function (done) {
            var emptySearchText = {
                search: {
                    value: '',
                    regex: false
                },
                columns: []
            };

            expect(query.buildFindParameters(emptySearchText)).to.deep.equal({});
            done();
        });

        it('should return a simple query if only one column is searchable', function (done) {
            var oneSearchableColumn = {
                search: {
                    value: 'searchText',
                    regex: false
                },
                columns: [
                    {
                        data: '',
                        name: '',
                        searchable: 'false'

                    },
                    {
                        data: 'name',
                        name: '',
                        searchable: 'true'
                    }
                ]
            };

            expect(query.buildFindParameters(oneSearchableColumn))
                .to.deep.equal({name: new RegExp(oneSearchableColumn.search.value, 'i')});
            done();
        });

        it('should return a compound $or query when multiple columns are searchable and a search value is provided',
            function (done) {
                var multipleSearchableColumns = {
                    search: {
                        value: 'searchText',
                        regex: false
                    },
                    columns: [
                        {
                            data: 'name',
                            name: '',
                            searchable: 'true'
                        },
                        {
                            data: 'email',
                            name: '',
                            searchable: 'true'
                        }
                    ]
                };

                expect(query.buildFindParameters(multipleSearchableColumns))
                    .to.deep.equal({
                        $or: [{
                            name: new RegExp(multipleSearchableColumns.search.value, 'i')
                        }, {
                            email: new RegExp(multipleSearchableColumns.search.value, 'i')
                        }]
                    });
                done();
            });
    });

    describe('buildSortParameters tests', function () {
        var query = datatablesQuery({});

        it('should build ascending sort parameters correctly', function (done) {
            var params = {
                columns: [
                    {
                        data: 'name',
                        name: '',
                        searchable: 'true',
                        orderable: 'true'
                    },
                    {
                        data: 'email',
                        name: '',
                        searchable: 'true',
                        orderable: 'true'
                    }
                ],
                order: [{
                    column: '0',
                    dir: 'asc'
                }]
            };

            expect(query.buildSortParameters(params)).to.equal('name');
            done();
        });

        it('should build descending sort parameters correctly', function (done) {
            var params = {
                columns: [
                    {
                        data: 'name',
                        name: '',
                        searchable: 'true',
                        orderable: 'true'
                    },
                    {
                        data: 'email',
                        name: '',
                        searchable: 'true',
                        orderable: 'true'
                    }
                ],
                order: [{
                    column: '1',
                    dir: 'desc'
                }]
            };

            expect(query.buildSortParameters(params)).to.equal('-email');
            done();
        });

        it('should return null if a non orderable column is set as sort param', function (done) {
            var params = {
                columns: [
                    {
                        data: 'name',
                        name: '',
                        searchable: 'true',
                        orderable: 'false'
                    },
                    {
                        data: 'email',
                        name: '',
                        searchable: 'true',
                        orderable: 'true'
                    }
                ],
                order: [{
                    column: '0',
                    dir: 'desc'
                }]
            };

            expect(query.buildSortParameters(params)).to.equal(null);
            done();
        });

        it('should return a correct search param if non searchable but orderable column is set as sort param',
            function (done) {
                var params = {
                    columns: [
                        {
                            data: 'name',
                            name: '',
                            searchable: 'true',
                            orderable: 'true'
                        },
                        {
                            data: 'email',
                            name: '',
                            searchable: 'false',
                            orderable: 'true'
                        }
                    ],
                    order: [{
                        column: '1',
                        dir: 'desc'
                    }]
                };

                expect(query.buildSortParameters(params)).to.equal('-email');
                done();
            });

        it('should return null if an out of bound column is set as sort param', function (done) {
            var params = {
                columns: [
                    {
                        data: 'name',
                        name: '',
                        searchable: 'true',
                        orderable: 'true'
                    },
                    {
                        data: 'email',
                        name: '',
                        searchable: 'true',
                        orderable: 'true'
                    }
                ],
                order: [{
                    column: '2',
                    dir: 'desc'
                }]
            };

            expect(query.buildSortParameters(params)).to.equal(null);
            done();
        });

        it('should return null if params doesnot contain an order field', function (done) {
            var params = {
                columns: [
                    {
                        data: 'name',
                        name: '',
                        searchable: 'true',
                        orderable: 'true'
                    },
                    {
                        data: 'email',
                        name: '',
                        searchable: 'true',
                        orderable: 'true'
                    }
                ]
            };

            expect(query.buildSortParameters(params)).to.equal(null);
            done();
        });

        it('should return null if params.order.column is not provided or is not a number', function (done) {
            var paramsSet = [{
                columns: [
                    {
                        data: 'name',
                        name: '',
                        searchable: 'true',
                        orderable: 'true'
                    },
                    {
                        data: 'email',
                        name: '',
                        searchable: 'true',
                        orderable: 'true'
                    }
                ],
                order: [{
                    dir: 'desc'
                }]
            }, {
                columns: [
                    {
                        data: 'name',
                        name: '',
                        searchable: 'true',
                        orderable: 'true'
                    },
                    {
                        data: 'email',
                        name: '',
                        searchable: 'true',
                        orderable: 'true'
                    }
                ],
                order: [{
                    column: 'abc',
                    dir: 'desc'
                }]
            }];

            paramsSet.forEach(function (params) {
                expect(query.buildSortParameters(params)).to.equal(null);
            });

            done();
        });

        it('should return null if params.columns is not an array', function (done) {
            var params = {
                order: [{
                    column: '1',
                    dir: 'desc'
                }]
            };

            expect(query.buildSortParameters(params)).to.equal(null);
            done();
        });
    });

    describe('buildSelectParameters tests', function () {
        var query = datatablesQuery({});

        it('should include only and all columns passed in parameters in the select params', function (done) {
            var params = {
                columns: [
                    {
                        data: 'name',
                        name: '',
                        searchable: 'true',
                        orderable: 'true'
                    },
                    {
                        data: 'email',
                        name: '',
                        searchable: 'false',
                        orderable: 'true'
                    }
                ],
                order: [{
                    column: '1',
                    dir: 'desc'
                }]
            };

            expect(query.buildSelectParameters(params))
                .to.deep.equal({
                    email: 1,
                    name: 1
                });
            done();
        });
    });

    describe('run tests', function () {
        it('should reject promise if params argument is lacking draw start or length', function (done) {
            var query = datatablesQuery({});

            async.each([{start: 0, length: 10}, {draw: 1, length: 10}, {draw: 1, start: 0}], function (params, cb) {
                var success = sinon.spy(),
                    error = sinon.spy();

                async.series([
                    function resolvePromise (cb) {
                        query.run(params).then(function () {
                            success();
                            cb();
                        }, function () {
                            error();
                            cb();
                        });
                    },
                    function test () {
                        expect(success.callCount).to.equal(0);
                        expect(error.calledOnce).to.equal(true);
                        cb();
                    }
                ]);
            }, function () {
                done();
            });
        });

        it('should reject promise if findParams is null', function (done) {
            var query = datatablesQuery({}),
                success = sinon.spy(),
                error = sinon.spy(),

                params = {
                    draw: '1',
                    start: '10',
                    length: '10',
                    order: [{
                        column: '0',
                        dir: 'desc'
                    }]
                };

            expect(query.buildFindParameters(params)).to.equal(null);

            async.series([
                function resolvePromise (cb) {
                    query.run(params).then(function () {
                        success();
                        cb();
                    }, function () {
                        error();
                        cb();
                    });
                },
                function test (cb) {
                    expect(success.callCount).to.equal(0);
                    expect(error.calledOnce).to.equal(true);
                    cb();
                },
                function end () {
                    done();
                }
            ]);
        });

        it('should reject promise if sortParams is null', function (done) {
            var query = datatablesQuery({}),
                success = sinon.spy(),
                error = sinon.spy(),
                params = {
                    draw: '1',
                    start: '10',
                    length: '10',
                    columns: [
                        {
                            data: 'name',
                            name: '',
                            searchable: 'true',
                            orderable: 'false'
                        },
                        {
                            data: 'email',
                            name: '',
                            searchable: 'true',
                            orderable: 'true'
                        }
                    ],
                    order: [{
                        column: '0',
                        dir: 'desc'
                    }]
                };

            expect(query.buildSortParameters(params)).to.equal(null);

            async.series([
                function resolvePromise (cb) {
                    query.run(params).then(function () {
                        success();
                        cb();
                    }, function () {
                        error();
                        cb();
                    });
                },
                function test (cb) {
                    expect(success.callCount).to.equal(0);
                    expect(error.calledOnce).to.equal(true);
                    cb();
                },
                function end () {
                    done();
                }
            ]);
        });
    });
});
