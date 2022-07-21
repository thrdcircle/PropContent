import React, { useEffect, useState } from "react";
import moment from "moment";
import parse from "html-react-parser";
import { getPageRes, getArticleRes } from "../../helper";
import { onEntryChange } from "../../contentstack-sdk";
import Skeleton from "react-loading-skeleton";
import RenderComponents from "../../components/render-components";
import ArchiveRelative from "../../components/archive-relative";
import { Page, Articles, PageUrl } from "../../typescript/pages";
import { Image } from "../typescript/action";

export default function Article({
  article,
  page,
  pageUrl,
}: {
  article: Articles;
  page: Page;
  pageUrl: PageUrl;
}) {
  const [getPost, setPost] = useState({ banner: page, post: article });
  async function fetchData() {
    try {
      const entryRes = await getArticleRes(pageUrl);
      const bannerRes = await getPageRes("/article");
      if (!entryRes || !bannerRes) throw new Error("Status: " + 404);
      setPost({ banner: bannerRes, post: entryRes });
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    onEntryChange(() => fetchData());
  }, [article]);

  const { post, banner } = getPost;
  return (
    <>
      <div className="blog-container">
        <article className="blog-detail">
          {post && post.title ? (
            <h2 {...post.$?.title}>{post.title}</h2>
          ) : (
            <h2>
              <Skeleton />
            </h2>
          )}
          {post && post.date ? (
            <p {...post.$?.date}>
              {moment(post.date).format("ddd, MMM D YYYY")},{" "}
              <strong {...post.author[0].$?.title}>
                {post.author[0].title}
              </strong>
            </p>
          ) : (
            <p>
              <Skeleton width={300} />
            </p>
          )}

          {post && post.body ? (
            <div {...post.$?.body}>{parse(post.body)}</div>
          ) : (
            <Skeleton height={800} width={600} />
          )}
        </article>

        {/* <div className="blog-column-right">
          <div className="related-post">
            {banner && banner?.page_components[2].widget ? (
              <h2 {...banner?.page_components[2].widget.$?.title_h2}>
                {banner?.page_components[2].widget.title_h2}
              </h2>
            ) : (
              <h2>
                <Skeleton />
              </h2>
            )}
            {post && post.related_post ? (
              <ArchiveRelative
                {...post.$?.related_post}
                blogs={post.related_post}
              />
            ) : (
              <Skeleton width={300} height={500} />
            )}
          </div>
        </div> */}
      </div>
    </>
  );
}
export async function getServerSideProps({ params }: any) {
  try {
    const page = await getPageRes("/article");
    const posts = await getArticleRes(`/article/${params.post}`);
    if (!page || !posts) throw new Error("404");

    return {
      props: {
        pageUrl: `/article/${params.post}`,
        article: posts,
        page,
      },
    };
  } catch (error) {
    console.error(error);
    return { notFound: true };
  }
}
