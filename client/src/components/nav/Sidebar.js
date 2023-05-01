import { NavLink } from "react-router-dom"
export default function Sidebar() {
    return (
    <>
    <ul class="nav nav-tabs">
        <li class="nav-item">
            <NavLink className="nav-link" to="/dashboard">Dashboard</NavLink>
        </li>
        <li class="nav-item">
            <NavLink className="nav-link" to="/user/wishlist">Wishlist</NavLink>
        </li>
        <li class="nav-item">
            <NavLink className="nav-link" to="/user/enquiries">Enquiries</NavLink>
        </li>
        <li class="nav-item">
            <NavLink className="nav-link" to="/ad/create">Create Ad</NavLink>
        </li>
        <li class="nav-item">
            <NavLink className="nav-link" to="/user/profile">Profile</NavLink>
        </li>
        {/* <li class="nav-item">
            <NavLink className="nav-link" to="/user/settings">Settings</NavLink>
        </li> */}
    </ul>
    </>
    )
}