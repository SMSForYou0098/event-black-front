import React, { Fragment } from 'react';

// router (keeping Next.js Link)
import Link from "next/link";

// static data
import { blogCategories } from '../../../StaticData/blogs';

const CategoriesWidget = ({ categories = [] }) => {
  return (
    <Fragment>
      <div id="categories-2" className="widget widget_categories">
        <h5 className="widget-title position-relative">Categories</h5>
        <ul className="p-0 m-0 list-unstyled">
          {categories.map((item, index) => (
            <li className="text-capitalize" key={index}>
              <Link href={`/blogs/filter/category?id=${item.id}`} className="position-relative">
                {item.title}
              </Link>
              {item.post_count && <span className="post_count">({item.post_count})</span>}
            </li>
          ))}
        </ul>
      </div>
    </Fragment>
  );
};

export default CategoriesWidget;
