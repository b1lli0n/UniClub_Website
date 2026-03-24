import React, { useState, useEffect, useRef } from 'react';
import { Container } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import ClubDetailCard from '../../components/ClubDetailCard';
import { getAllClubs } from '../../api/clubApi';
import '../../styles/ListOfClubs.css';


// Icon Components
const IconBase = ({ children, viewBox = '0 0 24 24' }) => (
  <svg
    className="club-catIcon"
    viewBox={viewBox}
    width="26"
    height="26"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const IconAll = () => (
  <IconBase>
    <path
      d="M4 6h16M4 12h16M4 18h16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </IconBase>
);

const IconBook = () => (
  <IconBase>
    <path
      d="M6.5 4.8h8.3c1.6 0 2.7 1.3 2.7 2.9v11.1c0 .8-.7 1.5-1.6 1.5H7.9c-.8 0-1.4-.7-1.4-1.5V6.3c0-.8.7-1.5 1.6-1.5Z"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinejoin="round"
    />
    <path d="M9.2 8h6.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    <path d="M9.2 11h6.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
  </IconBase>
);

const IconShoe = () => (
  <IconBase>
    <path
      d="M6 14.5c1.8 1.4 3.9 2.2 6.2 2.2h6.4c.9 0 1.7.7 1.7 1.7v.7H5.2c-.8 0-1.4-.6-1.4-1.4 0-1.6.8-2.8 2.2-3.2Z"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinejoin="round"
    />
    <path
      d="M10.2 12.2c.5 1.1 1.3 2.2 2.4 3.1"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
    />
  </IconBase>
);

const IconArt = () => (
  <IconBase>
    <path
      d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z"
      stroke="currentColor"
      strokeWidth="1.9"
    />
    <circle cx="8" cy="10" r="1.5" fill="currentColor" />
    <circle cx="16" cy="10" r="1.5" fill="currentColor" />
    <circle cx="12" cy="15" r="1.5" fill="currentColor" />
  </IconBase>
);

const IconEvent = () => (
  <IconBase>
    <path
      d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconBase>
);

// Category data with icons
const CLUB_CATEGORIES = [
  { id: 'all', labelTop: 'Tất cả', labelBottom: '', mapsTo: 'all', Icon: IconAll },
  { id: 'academic', labelTop: 'Học Thuật', labelBottom: '', mapsTo: 'Học Thuật', Icon: IconBook },
  { id: 'sports', labelTop: 'Thể Thao', labelBottom: '', mapsTo: 'Thể Thao', Icon: IconShoe },
  { id: 'arts', labelTop: 'Nghệ Thuật', labelBottom: '', mapsTo: 'Nghệ Thuật', Icon: IconArt },
  { id: 'events', labelTop: 'Sự Kiện', labelBottom: '', mapsTo: 'Sự Kiện', Icon: IconEvent },
];

const SORT_OPTIONS = [
  // Bỏ sắp xếp theo tên, chỉ giữ theo số lượng thành viên
  { value: 'members', label: 'Nhiều thành viên' },
  { value: 'members-asc', label: 'Ít thành viên' },
];
const CLUBS_PER_PAGE = 12;

const ListOfClubs = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  // Mặc định không sắp xếp (sortBy = '')
  const [sortBy, setSortBy] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);

// Scroll to top khi navigate đến trang này
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Add body class for styling
  useEffect(() => {
    document.body.classList.add('clubs-list-body');
    return () => {
      document.body.classList.remove('clubs-list-body');
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch clubs from API
  useEffect(() => {
    const fetchClubs = async () => {
      setLoading(true);
      try {
        const category = selectedCategory === 'all' ? null : selectedCategory;
        const response = await getAllClubs({
          category,
          sortBy: sortBy || null,
          search: searchQuery.trim() || null,
        });

        if (response.success) {
          const clubsWithId = response.data.map((club, index) => ({
            ...club,
            id: club?._id || `club-${index}`,
          }));
          setClubs(clubsWithId);
        }
      } catch (error) {
        console.error('Error fetching clubs:', error);
        toast.error(error.message || 'Không thể tải danh sách câu lạc bộ');
        setClubs([]);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchClubs();
    }, searchQuery ? 400 : 0);

    return () => clearTimeout(timeoutId);
  }, [selectedCategory, sortBy, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, sortBy, searchQuery]);

  const currentSortLabel =
    SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label || 'Mặc định';
  const totalPages = Math.max(1, Math.ceil(clubs.length / CLUBS_PER_PAGE));
  const paginatedClubs = clubs.slice(
    (currentPage - 1) * CLUBS_PER_PAGE,
    currentPage * CLUBS_PER_PAGE
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const getVisiblePages = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, 'dots', totalPages];
    if (currentPage >= totalPages - 2) {
      return [1, 'dots', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, 'dots', currentPage - 1, currentPage, currentPage + 1, 'dots-2', totalPages];
  };

  return (
    <div className="list-of-clubs-page">
      <Container className="loc-container py-4 pb-5">
        <section className="loc-cat-section" aria-label="Lọc theo danh mục">
          <div className="loc-cat-tabs" role="list">
            {CLUB_CATEGORIES.map(({ id, labelTop, labelBottom, mapsTo, Icon }) => {
              const isActive =
                selectedCategory === mapsTo ||
                (mapsTo === 'all' && selectedCategory === 'all');
              return (
                <button
                  key={id}
                  type="button"
                  className={`loc-cat-pill ${isActive ? 'is-active' : ''}`}
                  role="listitem"
                  onClick={() => setSelectedCategory(mapsTo)}
                  aria-label={`${labelTop} ${labelBottom}`}
                >
                  <span className="loc-cat-pill-icon" aria-hidden="true">
                    <Icon />
                  </span>
                  <span className="loc-cat-pill-label">{labelTop}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="loc-clubs-shell">
          <section className="loc-toolbar">
            <div className="loc-toolbar-row loc-toolbar-row--head">
              <div className="club-sectionTitleBlock">
                <h3 className="club-sectionTitle">
                  {selectedCategory === 'all'
                    ? 'Câu lạc bộ'
                    : `Câu lạc bộ • ${selectedCategory}`}
                </h3>
                <p className="club-sectionSub">
                  {loading ? 'Đang tải...' : `${clubs.length} câu lạc bộ.`}
                </p>
              </div>
            </div>
            <div className="loc-toolbar-row loc-toolbar-row--search">
              <div className="club-search-wrapper">
                <Search className="club-search-icon-svg" size={18} strokeWidth={2} aria-hidden />
                <input
                  type="text"
                  className="club-search-input"
                  placeholder="Tìm kiếm theo tên, mô tả..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="club-sort" ref={dropdownRef}>
                <label className="club-sortLabel" htmlFor="club-sort-trigger">Sắp xếp</label>
                <div className="club-dropdown">
                  <button
                    id="club-sort-trigger"
                    type="button"
                    className={`club-dropdown-trigger ${isDropdownOpen ? 'is-open' : ''
                      }`}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    disabled={loading}
                  >
                    <span>{currentSortLabel}</span>
                    <svg
                      className={`club-dropdown-arrow ${isDropdownOpen ? 'is-open' : ''
                        }`}
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <path
                        d="M4 6L8 10L12 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  {isDropdownOpen && (
                    <div className="club-dropdown-menu">
                      {SORT_OPTIONS.map((option) => {
                        const isSelected = sortBy === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            className={`club-dropdown-item ${isSelected ? 'is-selected' : ''}`}
                            onClick={() => {
                              if (isSelected) {
                                setSortBy('');
                              } else {
                                setSortBy(option.value);
                              }
                              setIsDropdownOpen(false);
                            }}
                          >
                            <span>{option.label}</span>
                            {isSelected && (
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                              >
                                <path
                                  d="M3 8L6.5 11.5L13 4.5"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <div className={`clubs-list ${!loading && paginatedClubs.length === 1 ? 'is-single-item' : ''}`}>
            {loading ? (
              <div className="club-empty glass-panel">
                <div className="club-emptyTitle">Đang tải dữ liệu...</div>
              </div>
            ) : clubs.length > 0 ? (
              paginatedClubs.map((club, index) => (
                <ClubDetailCard key={club.id || club._id || `club-card-${index}`} club={club} />
              ))
            ) : (
              <div className="club-empty glass-panel">
                <div className="club-emptyTitle">
                  Không tìm thấy câu lạc bộ phù hợp
                </div>
                <div className="club-emptySub">Thử đổi danh mục khác nhé.</div>
                <button
                  className="club-secondaryBtn"
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                >
                  Xoá bộ lọc
                </button>
              </div>
            )}
          </div>

          {!loading && clubs.length > 0 && totalPages > 1 && (
            <nav className="loc-pagination" aria-label="Phân trang câu lạc bộ">
              <button
                type="button"
                className="loc-page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                aria-label="Trang trước"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="loc-page-numbers">
                {getVisiblePages().map((item) =>
                  typeof item === 'number' ? (
                    <button
                      key={item}
                      type="button"
                      className={`loc-page-btn ${currentPage === item ? 'is-active' : ''}`}
                      onClick={() => setCurrentPage(item)}
                    >
                      {item}
                    </button>
                  ) : (
                    <span key={item} className="loc-page-dots" aria-hidden>
                      ...
                    </span>
                  )
                )}
              </div>

              <button
                type="button"
                className="loc-page-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                aria-label="Trang sau"
              >
                <ChevronRight size={16} />
              </button>
            </nav>
          )}
        </section>
      </Container>
    </div>
  );
};

export default ListOfClubs;
