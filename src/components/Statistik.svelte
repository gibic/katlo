<script lang="ts">
  export let winModal = false

  const obj = JSON.parse(localStorage.getItem('katlo-stats'))
  $: percent = Number(obj.gamesWon) / Number(obj.played) * 100
</script>
{#if winModal}
<h3 class="modal-title">Statistik</h3>
<section class="statistic">
    <article class="statistic__block">
        <h4>{obj.played}</h4>
        <p>x Main</p>
    </article>
    <article class="statistic__block">
        <h4>{isNaN(percent) ? 0 : percent}</h4>
        <p>% Menang</p>
    </article>
    <article class="statistic__block">
        <h4>{obj.streak}</h4>
        <p>Streak</p>
    </article>
    <article class="statistic__block">
        <h4>{obj.maxStreak}</h4>
        <p>Max Streak</p>
    </article>
</section>
{/if}
<style>
.statistic {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  width: 80%;
  margin: 0 auto;
}
.statistic__block p {
  font-size: 12px;
  text-align: center;
}
.modal-title {
  font-weight: 700;
  font-size: 16px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  text-align: center;
  margin-bottom: 16px;
}
h4 {
  font-size: 36px;
  font-weight: 400;
  text-align: center;
  letter-spacing: 0.05em;
  font-variant-numeric: proportional-nums;
}
</style>