import React, { Fragment } from 'react';

// router (keeping Next.js Link)
import Link from "next/link";
import Image from 'next/image';
import { useMyContext } from '@/Context/MyContextProvider';

// static data
import { blogRecent } from '../../../StaticData/blogs';

const RecentPost = ({ posts }) => {
  const recentPost = posts;
  const { createSlug } = useMyContext();

  return (
    <Fragment>
      <div className="widget iq-widget-blog">
        <h5 className="widget-title position-relative">Recent Post</h5>
        <ul className="list-inline p-0 m-0">
          {recentPost.map((item, index) => (
            <li key={index} className="d-flex align-items-center gap-4">
              <div className="img-holder">
                <Link href={`/blogs/${createSlug(item.title)}?key=${item.id}`}>
                  <Image
                    src={item.thumbnail || "/assets/images/no-banner.jpg"}
                    className="img-fluid h-100 w-100 object-cover"
                    alt={item.title}
                    width={80}
                    height={80}
                    style={{ objectFit: 'cover' }}
                  />
                </Link>
              </div>
              <div className="post-blog">
                <Link href={`/blogs/${createSlug(item.title)}?key=${item.id}`} className="new-link">
                  <h6 className="post-title">{item.title}</h6>
                </Link>
                <ul className="list-inline mb-2">
                  <li className="list-inline-item border-0 mb-0 pb-0">
                    <Link className="blog-data" href={`/blogs/${createSlug(item.title)}?key=${item.id}`}>
                      <i className="fa fa-calendar-alt me-1" aria-hidden="true" style={{ color: '#b51515' }}></i>
                      {item.created_at ? new Date(item.created_at).toLocaleDateString() : ""}
                    </Link>
                  </li>
                </ul>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Fragment>
  );
};

export default RecentPost;
