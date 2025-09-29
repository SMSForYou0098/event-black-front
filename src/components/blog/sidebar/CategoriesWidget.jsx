import React, { Fragment } from 'react';

// router (keeping Next.js Link)
import Link from "next/link";

// static data
import { blogCategories } from '../../../StaticData/blogs';

const CategoriesWidget = () => {
  return (
    <Fragment>
      <div id="categories-2" className="widget widget_categories">
        <h5 className="widget-title position-relative">Categories</h5>
        <ul className="p-0 m-0 list-unstyled">
          {blogCategories.map((item, index) => (
            <li className="text-capitalize" key={index}>
              <Link href="/blogs/filter/category" className="position-relative">
                {item.title}
              </Link>
              <span className="post_count">({item.post_count})</span>
            </li>
          ))}
        </ul>
      </div>
    </Fragment>
  );
};

export default CategoriesWidget;
