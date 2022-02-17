import { GetStaticProps } from 'next'
import React, { useState } from 'react'
import PortableText from 'react-portable-text'
import Header from '../../components/Header'
import { sanityClient, urlFor } from '../../sanity'
import { Post } from '../../typings'
import { useForm, SubmitHandler } from 'react-hook-form'
interface Props {
  post: Post
}
interface FormInput {
  _id: string
  name: string
  email: string
  comment: string
}
const Post = ({ post }: Props) => {
  console.log(post)
  const [submitted, setSubmitted] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInput>()

  const onSubmit: SubmitHandler<FormInput> = async (data) => {
    await fetch('/api/createComment', {
      method: 'POST',
      body: JSON.stringify(data),
    })
      .then(() => {
        setSubmitted(true)
      })
      .catch((err) => {
        console.log(err)
        setSubmitted(false)
      })
  }

  return (
    <main className={`mx-auto max-w-7xl`}>
      <Header />
      <img
        className={`h-40 w-full object-cover`}
        src={urlFor(post.mainImage).url()!}
        alt=""
      />
      <article className={`max-x-3xl mx-auto p-5`}>
        <h1 className={`mt-10 mb-3 text-3xl`}>{post.title}</h1>
        <h2 className={`mb-2 text-xl font-light text-gray-500`}>
          {post.description}
        </h2>
        <div className={`flex items-center space-x-2`}>
          <img
            className={`h-10 w-10 rounded-full`}
            src={urlFor(post.author.image).url()!}
            alt=""
          />
          <p className={`text-sm font-extralight`}>
            Blog Post by{' '}
            <span className={`text-green-600`}>{post.author.name}</span> -
            Published at {new Date(post._createdAt).toLocaleString()}
          </p>
        </div>
        <div className={`mt-10`}>
          <PortableText
            dataset={process.env.NEXT_PUBLIC_SANITY_DATASET}
            projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}
            content={post.body}
            serializers={{
              h1: (props: any) => (
                <h1 className={`my-5 text-2xl font-bold`} {...props} />
              ),
              h2: (props: any) => (
                <h2 className={`my-5 text-xl font-bold`} {...props} />
              ),
              li: ({ children }: any) => (
                <li className={`ml-4 list-disc`}>{children}</li>
              ),
              link: ({ href, children }: any) => (
                <a href={href} className={`text-blue-500 hover:underline`}>
                  {children}
                </a>
              ),
            }}
          />
        </div>
      </article>
      <hr className={`my-5 mx-auto max-w-lg border border-yellow-500`} />

      {submitted ? (
        <div className={`my-10 flex flex-col bg-yellow-500 p-10 text-white`}>
          <h3 className={`text-3xl font-bold`}>
            Thank you for submitting your comment!
          </h3>
          <p>Once it has been approved, it will appear below!</p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className={`mx-auto mb-10 flex max-w-2xl flex-col p-5`}
        >
          <h3 className={`text-sm text-yellow-500`}>Enjoy the article?</h3>
          <h4 className={`text-3xl font-bold`}>Leave a comment below!</h4>
          <hr className={`mt-2 py-3`} />
          <input
            type="hidden"
            value={post._id}
            {...register('_id')}
            name={post._id}
          />
          <label className={`mb-5 block`}>
            <span className={`text-gray-700`}>Name</span>
            <input
              className={`form-input mt-1 block w-full rounded border py-2 px-3 shadow `}
              type="text"
              placeholder="Name"
              {...register('name', { required: true })}
            />
          </label>
          <label className={`mb-5 block`}>
            <span className={`text-gray-700`}>Email</span>
            <input
              className={`form-input mt-1 block w-full rounded border py-2 px-3 shadow `}
              type="email"
              placeholder="Email"
              {...register('email', { required: true })}
            />
          </label>
          <label className={`mb-5 block`}>
            <span className={`text-gray-700`}>Comment</span>
            <textarea
              className={`form-text-area mt-1 block w-full rounded border py-2 px-3 shadow `}
              rows={8}
              placeholder="Comment"
              {...register('comment', { required: true })}
            />
          </label>
          {/* Errors Returned */}
          <div className="flex flex-col py-5">
            {errors.name && (
              <span className={`text-red-500`}>
                - The Name field is required
              </span>
            )}
            {errors.comment && (
              <span className={`text-red-500`}>
                - The Comment field is required
              </span>
            )}
            {errors.email && (
              <span className={`text-red-500`}>
                - The Email field is required
              </span>
            )}
          </div>
          <input
            type="submit"
            className={`focus:shadow-ouline cursor-pointer rounded bg-yellow-500 py-2 px-4
          font-bold text-white shadow hover:bg-yellow-400 focus:outline-none
          `}
          />
        </form>
      )}
      <div
        className="sapce-y-2 my-10 mx-auto flex max-w-2xl 
      flex-col p-10 shadow shadow-yellow-500"
      >
        <h3 className="text-4xl">Comments</h3>
        <hr className={`my-2`} />
        {post.comments.map((item) => (
          <div key={item._id}>
            <p>
              <span className="text-yellow-500">{item.name}</span>:{' '}
              {item.comment}
            </p>
          </div>
        ))}
      </div>
    </main>
  )
}

export default Post

export const getStaticPaths = async () => {
  const query = `
*[_type=="post"]{
    _id,
    slug{
    current
  }
  
  }
`
  const posts = await sanityClient.fetch(query)
  const paths = posts.map((post: Post) => ({
    params: {
      slug: post.slug.current,
    },
  }))
  return { paths, fallback: 'blocking' }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const query = `
  *[_type=="post" && slug.current=="medium-blog"][0]{
    _id,
    _createAt,
    title,
    author->{
    name,
    image
  },
  "comments": *[
    _type=="comment" && post._ref == ^._id && approved==true
  ],
  description,
  mainImage,
  slug,
  body
  }
`
  const post = await sanityClient.fetch(query, {
    slug: params?.slug,
  })

  if (!post) {
    return {
      notFound: true,
    }
  }
  return {
    props: {
      post,
    },
    revalidate: 60,
  }
}
