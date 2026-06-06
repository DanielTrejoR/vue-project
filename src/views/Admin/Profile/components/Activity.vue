<template>
  <div class="user-activity">
    <!-- Post 1 -->
    <el-card class="post" shadow="hover">
      <el-row class="text-align-left r-3">
        <el-col :span="2">
            <el-avatar
                size="large"
                src="https://wpimg.wallstcn.com/57ed425a-c71e-4201-9428-68760c0537c4.jpg?imageView2/1/w/80/h/80"
            />
        </el-col>
        <el-col :span="22" class="pl-3">
            <h4 class="username">Iron Man</h4>
            <p class="description">Shared publicly - 7:30 PM today</p>
        </el-col>
      </el-row>
      <el-divider />
      <p class="text-align-left">
        Lorem ipsum represents a long-held tradition for designers,
        typographers and the like. Some people hate it and argue for
        its demise, but others ignore the hate as they create awesome
        tools to help create filler text for everyone from bacon lovers
        to Charlie Sheen fans.
      </p>
      <el-row class="actions">
        <el-col :span="4">
          <el-button text icon="Share">Share</el-button>
        </el-col>
        <el-col :span="4">
          <el-button text><i class="fa fa-thumbs-up pr-2" aria-hidden="true"> </i>Like</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- Post 3 con imágenes -->
    <el-card class="post" shadow="hover">
      <el-row class="text-align-left r-3">
        <el-col :span="2">
          <el-avatar
            size="large"
            src="https://wpimg.wallstcn.com/fb57f689-e1ab-443c-af12-8d4066e202e2.jpg?imageView2/1/w/80/h/80"
          />
        </el-col>
        <el-col :span="22" class="pl-2">
          <h4 class="username">Spider Man</h4>
          <p class="description">Posted 4 photos - 2 days ago</p>
        </el-col>
      </el-row>
      <el-divider />
      <el-carousel :interval="6000" type="card" height="220px">
        <el-carousel-item v-for="item in carouselImages" :key="item">
          <img :src="item + '?imageView2/2/h/440'" class="image" />
        </el-carousel-item>
      </el-carousel>
      <el-row class="actions">
        <el-col :span="4">
          <el-button text icon="Share">Share</el-button>
        </el-col>
        <el-col :span="4">
            <el-button text><i class="far fa-thumbs-up pr-2" aria-hidden="true"> </i> Like</el-button>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
const carouselImages = [
    'https://wpimg.wallstcn.com/9679ffb0-9e0b-4451-9916-e21992218054.jpg',
    'https://wpimg.wallstcn.com/bcce3734-0837-4b9f-9261-351ef384f75a.jpg',
    'https://wpimg.wallstcn.com/d1d7b033-d75e-4cd6-ae39-fcd5f1c0a7c5.jpg',
    'https://wpimg.wallstcn.com/50530061-851b-4ca5-9dc5-2fead928a939.jpg'
]
</script>

<style lang="scss" scoped>

.user-activity {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.post {
    .username {
        font-size: 16px;
        font-weight: bold;
        color: var(--text-color);
    }

    .description {
        font-size: 13px;
        color: var(--text-color);
        opacity: 0.7;
    }

    .image {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .actions {
        margin-top: 10px;
    }
}
</style>
