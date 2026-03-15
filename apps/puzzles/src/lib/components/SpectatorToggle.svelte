<script lang="ts">
    let { checked, setChecked } = $props<{ 
        checked: boolean,
        setChecked: (check: any) => void,
    }>();
</script>

<label class="switch">
    <input type="checkbox" id="togBtn" value={checked} onclick={() => setChecked(!checked)}>
    <div class="slider round text-nowrap text-xl font-bold">
        <span class="on">Player Mode</span>
        <span class="off">Spectator Mode</span>
    </div>
</label>

<style>
.switch {
    position: relative;
    display: inline-block;
    width: 250px;
    height: 38px;
}

.switch input {
    display:none;
}

.slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: oklch(79.5% 0.184 86.047) ;
    -webkit-transition: .4s;
    transition: .4s;
}

.slider:before {
    position: absolute;
    content: "";
    height: 30px;
    width: 30px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    -webkit-transition: .4s;
    transition: .4s;
}

input:checked + .slider {
    background-color: #2ab934;
}

input:focus + .slider {
    box-shadow: 0 0 1px #2196F3;
}

input:checked + .slider:before {
    -webkit-transform: translateX(211px);
    -ms-transform: translateX(211px);
    transform: translateX(211px);
}

.on {
  display: none;
}

.on, .off {
  color: white;
  position: absolute;
  transform: translate(-50%,-50%);
  top: 50%;
  left: 50%;
}

input:checked+ .slider .on {
    display: block;
}

input:checked + .slider .off {
    display: none;
}


.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}
</style>