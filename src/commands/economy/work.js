const {addMoney, formatMoney} = require('../../functions/utilities/moneyUtils')
const {sendEmbed, EmbedType} = require('../../functions/utilities/embedUtils')
const {SlashCommandBuilder} = require('discord.js');
const {getCooldown, setCooldown} = require('../../functions/utilities/cooldownManager');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('work')
        .setDescription('Work for money!'),
    async execute(interaction) {

        const jobs = [
            ["🍽️ Restaurant Server", "You worked as a server and earned <money>!", 150, 500],
            ["🎣 Fishing Trip Guide", "You earned <money> taking people on exciting fishing trips!", 200, 600],
            ["👶 Babysitter Extraordinaire", "Congratulations! You made <money> as a babysitter.", 100, 400],
            ["🍃 Yard Work Ninja", "You earned <money> mowing lawns and doing yard work!", 180, 450],
            ["📚 Knowledge Guru", "Great job as a tutor! You earned <money> sharing your wisdom.", 250, 800],
            ["🏊‍♂️ Lifesaving Hero", "You worked as a lifeguard and earned <money>!", 180, 550],
            ["🐾 Pet Whisperer", "You earned <money> pet sitting.", 120, 350],
            ["🚚 Speedy Delivery Driver", "Congratulations! You made <money> as a delivery driver.", 220, 600],
            ["🐕 Dog's Best Friend", "Great job as a dog walker! You earned <money>.", 100, 300],
            ["☕ Coffee Connoisseur", "You worked as a barista and earned <money>!", 170, 450],
            ["👨‍💻 Coding Wizard", "You worked as a software developer and earned <money>!", 500, 1500],
            ["🎨 Artistic Brush Strokes", "You earned <money> painting houses!", 300, 800],
            ["💪 Fitness Motivator", "Congratulations! You made <money> as a fitness trainer.", 200, 600],
            ["🚗 Car Mechanic", "You earned <money> fixing cars!", 250, 700],
            ["📸 Photography Pro", "Great job as a photographer! You earned <money>.", 150, 500],
            ["🍔 Master Chef", "You worked as a chef and earned <money>!", 300, 900],
            ["💻 Web Design Guru", "You earned <money> designing websites.", 200, 600],
            ["🔒 Security Expert", "Congratulations! You made <money> as a security guard.", 180, 500],
            ["💰 Cashier at the Mega Mart", "Great job as a cashier! You earned <money>.", 120, 350],
            ["📞 Receptionist Extraordinaire", "You worked as a receptionist and earned <money>!", 150, 450],
            ["🚀 Space Tour Guide", "You earned <money> giving tourists an out-of-this-world experience!", 1000, 2000],
            ["🎃 Halloween Pumpkin Carver", "You earned <money> carving spooky pumpkins!", 200, 500],
            ["🎅 Santa's Elf", "Congratulations! You made <money> spreading holiday cheer!", 250, 600],
            ["🌺 Tropical Island Entertainer", "You earned <money> performing at beach resorts!", 300, 800],
            ["🌟 Starship Captain", "Great job exploring the universe! You earned <money>.", 800, 1500],
            ["👨‍🚀 Rocket Scientist", "You worked as a rocket scientist and earned <money>!", 700, 1200],
            ["🍫 Chocolate Taste Tester", "You earned <money> tasting delicious chocolates!", 150, 300],
            ["🍿 Movie Critic", "Congratulations! You made <money> reviewing the latest films.", 100, 200],
            ["🍦 Ice Cream Connoisseur", "Great job taste testing ice creams! You earned <money>.", 120, 250],
            ["🎤 Karaoke Star", "You worked as a karaoke host and earned <money>!", 180, 350],
        ];

        const cooldown = await getCooldown(interaction.user.id, interaction.guild.id, 'work');
        if (cooldown !== false) return await sendEmbed(interaction, EmbedType.ERROR, 'Work', `You can work again <t:${Math.floor(cooldown / 1000)}:R>`, false);
        if (await setCooldown(interaction.user.id, interaction.guild.id, 'work') === false) return await sendEmbed(interaction, EmbedType.ERROR, 'Work', 'An error occurred while setting your cooldown.', false);

        const randomAmount = (min, max) => {
            const randomNum = Math.random() * (max - min) + min;
            return parseFloat(randomNum.toFixed(2));
        };

        const pickRandomJobMessage = async () => {
            const randomIndex = Math.floor(Math.random() * jobs.length);
            const [title, message, minPay, maxPay] = jobs[randomIndex];
            const randomPay = formatMoney(parseFloat(randomAmount(minPay, maxPay)));
            const newMessage = message.replace("<money>", `:pound: ${randomPay}`);
            return [title, newMessage];
        }

        const jobMessage = await pickRandomJobMessage();
        const jobTitle = jobMessage[0], jobDescription = jobMessage[1];
        await addMoney(interaction.user.id, interaction.guild.id, randomAmount(100, 500));
        await sendEmbed(interaction, EmbedType.SUCCESS, jobTitle, jobDescription, false);
    }
}
