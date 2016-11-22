import React, { PropTypes, createClass, Component } from 'react';

export  default  class Search extends Component {

    render() {
        return (
            <div className="padding base">
                <div className="box">
                    <div className="box-header">
                        <h2>DataTables</h2>
                    </div>
                    <div className="table-responsive">
                        <div id="DataTables_Table_0_wrapper"
                             className="dataTables_wrapper form-inline dt-bootstrap no-footer">
                            <div className="row">
                                <div className="col-sm-6">
                                    <div className="dataTables_length" id="DataTables_Table_0_length">
                                        <label>Show
                                            <select className="form-control input-sm">
                                                <option value={10}>10</option>
                                                <option value={25}>25</option>
                                                <option value={50}>50</option>
                                                <option value={100}>100</option>
                                            </select> entries
                                        </label>
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                    <div className="dataTables_filter pull-right">
                                        <label>Search:
                                            <input type="search" className="form-control input-sm"/>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-12">
                                    <table className="table table-striped b-t b-b dataTable no-footer">
                                        <thead>
                                        <tr role="row">
                                            <th style={{ width: 166 }} className="sorting_asc" tabIndex={0}
                                                aria-controls="DataTables_Table_0" rowSpan={1} colSpan={1}
                                                aria-label="Rendering engine: activate to sort column descending"
                                                aria-sort="ascending">Rendering engine
                                            </th>
                                            <th style={{ width: 216 }} className="sorting" tabIndex={0}
                                                aria-controls="DataTables_Table_0" rowSpan={1} colSpan={1}
                                                aria-label="Browser: activate to sort column ascending">Browser
                                            </th>
                                            <th style={{ width: 215 }} className="sorting" tabIndex={0}
                                                aria-controls="DataTables_Table_0" rowSpan={1} colSpan={1}
                                                aria-label="Platform(s): activate to sort column ascending">Platform(s)
                                            </th>
                                            <th style={{ width: 115 }} className="sorting" tabIndex={0}
                                                aria-controls="DataTables_Table_0" rowSpan={1} colSpan={1}
                                                aria-label="Engine version: activate to sort column ascending">Engine
                                                version
                                            </th>
                                            <th style={{ width: 115 }} className="sorting" tabIndex={0}
                                                aria-controls="DataTables_Table_0" rowSpan={1} colSpan={1}
                                                aria-label="CSS grade: activate to sort column ascending">CSS grade
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        <tr role="row" className="odd">
                                            <td className="sorting_1">Gecko</td>
                                            <td>Firefox 1.0</td>
                                            <td>Win 98+ / OSX.2+</td>
                                            <td>1.7</td>
                                            <td>A</td>
                                        </tr>
                                        <tr role="row" className="even">
                                            <td className="sorting_1">Gecko</td>
                                            <td>Firefox 1.5</td>
                                            <td>Win 98+ / OSX.2+</td>
                                            <td>1.8</td>
                                            <td>A</td>
                                        </tr>
                                        <tr role="row" className="odd">
                                            <td className="sorting_1">Gecko</td>
                                            <td>Firefox 2.0</td>
                                            <td>Win 98+ / OSX.2+</td>
                                            <td>1.8</td>
                                            <td>A</td>
                                        </tr>
                                        <tr role="row" className="even">
                                            <td className="sorting_1">Gecko</td>
                                            <td>Firefox 3.0</td>
                                            <td>Win 2k+ / OSX.3+</td>
                                            <td>1.9</td>
                                            <td>A</td>
                                        </tr>
                                        <tr role="row" className="odd">
                                            <td className="sorting_1">Gecko</td>
                                            <td>Camino 1.0</td>
                                            <td>OSX.2+</td>
                                            <td>1.8</td>
                                            <td>A</td>
                                        </tr>
                                        <tr role="row" className="even">
                                            <td className="sorting_1">Gecko</td>
                                            <td>Camino 1.5</td>
                                            <td>OSX.3+</td>
                                            <td>1.8</td>
                                            <td>A</td>
                                        </tr>
                                        <tr role="row" className="odd">
                                            <td className="sorting_1">Gecko</td>
                                            <td>Netscape 7.2</td>
                                            <td>Win 95+ / Mac OS 8.6-9.2</td>
                                            <td>1.7</td>
                                            <td>A</td>
                                        </tr>
                                        <tr role="row" className="even">
                                            <td className="sorting_1">Gecko</td>
                                            <td>Netscape Browser 8</td>
                                            <td>Win 98SE+</td>
                                            <td>1.7</td>
                                            <td>A</td>
                                        </tr>
                                        <tr role="row" className="odd">
                                            <td className="sorting_1">Gecko</td>
                                            <td>Netscape Navigator 9</td>
                                            <td>Win 98+ / OSX.2+</td>
                                            <td>1.8</td>
                                            <td>A</td>
                                        </tr>
                                        <tr role="row" className="even">
                                            <td className="sorting_1">Gecko</td>
                                            <td>Mozilla 1.0</td>
                                            <td>Win 95+ / OSX.1+</td>
                                            <td>1</td>
                                            <td>A</td>
                                        </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-6">
                                    <div className="dataTables_info">Showing 1 to 10 of 57 entries
                                    </div>
                                </div>
                                <div className="col-sm-6 ">
                                    <div className="dataTables_paginate paging_simple_numbers pull-right">
                                        <ul className="pagination">
                                            <li className="paginate_button previous disabled">
                                                <a href="#">Previous</a>
                                            </li>
                                            <li className="paginate_button active">
                                                <a href="#">1</a>
                                            </li>

                                            <li className="paginate_button ">
                                                <a href="#">2</a>
                                            </li>

                                            <li className="paginate_button ">
                                                <a href="#">3</a>
                                            </li>
                                            <li className="paginate_button ">
                                                <a href="#">4</a>
                                            </li>
                                            <li className="paginate_button ">
                                                <a href="#">5</a>
                                            </li>

                                            <li className="paginate_button next">
                                                <a href="#">Next</a>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}