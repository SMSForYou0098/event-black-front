import React, { Fragment } from 'react';

// router (keeping Next.js Link)
import Link from "next/link";

// static data
import { blogTags } from '../../../StaticData/blogs';

const TagsWidget = () => {
  return (
    <Fragment>
      <div id="tag_cloud-2" className="widget">
        <h5 className="widget-title position-relative">Tags</h5>
        <div className="tagcloud">
          <ul className="p-0 m-0 list-unstyled gap-2 widget_tags">
            {blogTags.map((tags, index) => (
              <li key={index}>
                <Link href="/blogs/filter/tags" className="position-relative">
                  {tags.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Fragment>
  );
};

export default TagsWidget;
