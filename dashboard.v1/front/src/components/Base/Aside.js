import React from 'react';
import { Link } from 'react-router'

export default React.createClass({
    render() {
        return (
            <div className="left navside black dk">
                <div className="navbar no-radius">
                    <a className="navbar-brand">
                        <img src="https://oerugfbxb.qnssl.com/wp-content/themes/Earthshaker-1/images/logo-footer.png"/>
                    </a>
                </div>
                <div className="hide-scroll">
                    <nav className="scroll nav-active-primary nav-light">
                        <ul className="nav">

                            <li>
                                <Link to="/dashboard">
                                    <span className="nav-icon">
                                        <i className="material-icons">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"
                                                 viewBox="0 0 48 48">
                                                <rect x="20" y="32" width="8" height="8" fill="#1989fa"/>
                                                <rect x="8" y="20" width="8" height="8" fill="#1989fa"/>
                                                <rect x="20" y="8" width="8" height="8" fill="#1989fa"/>
                                                <rect x="32" y="20" width="8" height="8" fill="#1989fa"/>
                                            </svg>
                                        </i>
                                    </span>
                                    <span className="nav-text">Dashboard</span>
                                </Link>
                            </li>


                            <li>
                                <Link to="/editor">
                                <span className="nav-icon">
                                    <i className="material-icons">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"
                                             viewBox="0 0 48 48">
	                                        <rect x="14" y="12" width="4" height="24" fill="#1989fa"/>
                                            <rect x="30" y="12" width="4" height="24" fill="#1989fa"/>
                                        </svg>
                                    </i>
                                </span>
                                    <span className="nav-text">Editor</span>
                                </Link>
                            </li>
                            {/*<li>*/}
                                {/*<Link to="/search">*/}
                                {/*<span className="nav-icon">*/}
                                   {/*<i className="material-icons">*/}
                                        {/*<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"*/}
                                             {/*viewBox="0 0 48 48">*/}
	                                        {/*<rect x="8" y="34" width="20" height="4" fill="#1989fa"/>*/}
	                                        {/*<rect x="8" y="18" width="32" height="4" fill="#1989fa"/>*/}
                                        {/*</svg>*/}
                                    {/*</i>*/}
                                {/*</span>*/}
                                    {/*<span className="nav-text">Search</span>*/}
                                {/*</Link>*/}
                            {/*</li>*/}


                        </ul>
                    </nav>
                </div>

            </div>
        )
    }
})