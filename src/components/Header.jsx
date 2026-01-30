/* Simple header matching My Club topbar */
const Header = ({ searchValue = '', onSearchChange = () => { } }) => {
  return (
    <div className="myclub-topbar glass-card">
      <button className="myclub-logo">Logo</button>

      <div className="myclub-search">
        <input
          type="text"
          placeholder="Search"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="myclub-actions">
        <button className="myclub-pill">Thông báo</button>
        <button className="myclub-avatar">Avt + Name</button>
      </div>
    </div>
  );
};

export default Header;
