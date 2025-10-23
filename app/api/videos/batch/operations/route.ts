import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, videoIds, data } = body

    if (!action || !videoIds || !Array.isArray(videoIds)) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    let result: any = {
      success: true,
      processed: 0
    }

    switch (action) {
      case 'delete':
        // Batch delete videos
        const deleteResult = await prisma.video.deleteMany({
          where: {
            id: { in: videoIds }
          }
        })
        result.processed = deleteResult.count
        result.message = `${deleteResult.count} videos deleted`
        break

      case 'addTags':
        // Add tags to multiple videos
        if (!data.tagIds || !Array.isArray(data.tagIds)) {
          return NextResponse.json(
            { error: 'Tag IDs are required' },
            { status: 400 }
          )
        }

        let addedCount = 0
        for (const videoId of videoIds) {
          for (const tagId of data.tagIds) {
            try {
              await prisma.videoTagRelation.create({
                data: {
                  videoId,
                  tagId
                }
              })
              addedCount++
            } catch (error) {
              // Skip if relation already exists
            }
          }
        }

        // Update usage counts
        await prisma.videoTag.updateMany({
          where: { id: { in: data.tagIds } },
          data: { usageCount: { increment: videoIds.length } }
        })

        result.processed = addedCount
        result.message = `Added tags to ${videoIds.length} videos`
        break

      case 'removeTags':
        // Remove tags from multiple videos
        if (!data.tagIds || !Array.isArray(data.tagIds)) {
          return NextResponse.json(
            { error: 'Tag IDs are required' },
            { status: 400 }
          )
        }

        const removeResult = await prisma.videoTagRelation.deleteMany({
          where: {
            videoId: { in: videoIds },
            tagId: { in: data.tagIds }
          }
        })

        result.processed = removeResult.count
        result.message = `Removed tags from ${videoIds.length} videos`
        break

      case 'addToCollection':
        // Add multiple videos to a collection
        if (!data.collectionId) {
          return NextResponse.json(
            { error: 'Collection ID is required' },
            { status: 400 }
          )
        }

        // Get current max order
        const maxOrder = await prisma.videoCollectionItem.findFirst({
          where: { collectionId: data.collectionId },
          orderBy: { order: 'desc' },
          select: { order: true }
        })

        let order = (maxOrder?.order || 0) + 1
        let collectionCount = 0

        for (const videoId of videoIds) {
          try {
            await prisma.videoCollectionItem.create({
              data: {
                collectionId: data.collectionId,
                videoId,
                order: order++
              }
            })
            collectionCount++
          } catch (error) {
            // Skip if already in collection
          }
        }

        // Update video count
        await prisma.videoCollection.update({
          where: { id: data.collectionId },
          data: {
            videoCount: { increment: collectionCount }
          }
        })

        result.processed = collectionCount
        result.message = `Added ${collectionCount} videos to collection`
        break

      case 'addToFavorites':
        // Add multiple videos to favorites
        let favoriteCount = 0
        for (const videoId of videoIds) {
          try {
            await prisma.videoFavorite.create({
              data: { videoId }
            })
            favoriteCount++
          } catch (error) {
            // Skip if already favorited
          }
        }

        result.processed = favoriteCount
        result.message = `Added ${favoriteCount} videos to favorites`
        break

      case 'removeFromFavorites':
        // Remove multiple videos from favorites
        const favRemoveResult = await prisma.videoFavorite.deleteMany({
          where: {
            videoId: { in: videoIds }
          }
        })

        result.processed = favRemoveResult.count
        result.message = `Removed ${favRemoveResult.count} videos from favorites`
        break

      case 'updateStatus':
        // Update status for multiple videos
        if (!data.status) {
          return NextResponse.json(
            { error: 'Status is required' },
            { status: 400 }
          )
        }

        const statusResult = await prisma.video.updateMany({
          where: { id: { in: videoIds } },
          data: { status: data.status }
        })

        result.processed = statusResult.count
        result.message = `Updated status for ${statusResult.count} videos`
        break

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error processing batch operation:', error)
    return NextResponse.json(
      { error: 'Failed to process batch operation' },
      { status: 500 }
    )
  }
}
