import React from 'react'
import { Slide } from 'react-slideshow-image'
import 'react-slideshow-image/dist/styles.css'
import Image from 'next/image'
import { format } from 'date-fns'

export default function Tweet({
  id,
  title,
  sub_title,
  create_time,
  date,
  images,
}) {
  // 使用環境變數來設置 API URL
  const API_URL = process.env.API_URL || 'https://widm-back-end.nevercareu.space';;

  return (
    <div className="my-3 w-full max-w-3xl rounded-md border border-gray-100 bg-white px-4 py-4 shadow-sm shadow-gray-300 dark:border-zinc-900 dark:bg-zinc-900 dark:shadow-none">
      <div className="flex items-center">
        <a className="flex h-12 w-12" target="_blank" rel="noopener noreferrer">
          <Image
            height={48}
            width={48}
            src={"/static/images/Lab_Icon.png"}
            className="rounded-full"
          />
        </a>
        <a target="_blank" rel="noopener noreferrer" className="author ml-4 flex flex-col !no-underline">
          <p
            className="flex text-xl items-center font-bold leading-5 !text-gray-900 dark:!text-gray-100 "
            title="WIDM"
          >
            {title}
          </p>
          <span className="text-sm mt-1 !text-gray-500" title={`@ Web Intelligence and Data Mining Laboratory`}>
            @Web Intelligence and Data Mining Laboratory
          </span>
        </a>
      </div>

      <div className="mt-4 mb-1 whitespace-pre-wrap leading-normal !text-gray-700 dark:!text-gray-200">
        {sub_title}
      </div>
      {images && images.length ? (
        <div className="my-2">
          <Slide transitionDuration={500}>
            {images.map((image) => (
              <div className="each-slide" key={image} style={{ display: 'flex', justifyContent: 'center' }}>
                <div
                  className="relative flex items-center justify-center"
                  style={{
                    width: '650px',  // 固定 Slide 的外框寬度
                    height: '400px', // 固定 Slide 的外框高度
                    overflow: 'hidden' // 隱藏超出的部分
                  }}
                >
                  <img
                    alt={title}
                    src={`${API_URL}/activity/${id}/activity-image/${image}`}  // 使用環境變數的 API URL
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',  // 確保圖片縮小至能夠放入外框
                    }}
                    className="rounded"
                  />
                </div>
              </div>
            ))}
          </Slide>
        </div>
      ) : null}
      <a
        className="text-sm !text-gray-500 hover:!underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        <time title={`Time Posted: ${new Date(date).toUTCString()}`} dateTime={new Date(date).toISOString()}>
          Update by {format(new Date(date), 'MMM d, y')}
        </time>
      </a>
    </div>
  )
}
